const http2 = require('http2');
const { debug, debugEnabled } = require('@binaryx/debug');
const getTraceId = require('./get-trace-id');
const getSuitableBody = require('./get-suitable-body');
const { curlFormatHttp2 } = require('./curl-format');
// eslint-disable-next-line no-unused-vars
const { getCleanRequestHeaders, getCleanResponseHeaders } = require('./get-clean-headers');

const log = debug('@binaryx/request:HTTP/2');
const logError = debugEnabled('@binaryx/request:HTTP/2');
let client;

const defaultAuthority = process.env.HTTP2_AUTHORITY;
function getAuthority(authority) {
  if (authority && typeof authority === 'string') {
    return authority;
  }

  return defaultAuthority;
}

function closeClient() {
  if (!client) return;

  if (client.close) { // Added in nodejs v9.4.0
    client.close();
  } else if (client.destroy) { // Added in nodejs v8.4.0
    client.destroy();
  }

  client = null;
}

function createClient(userAuthority) {
  if (client && !client.closed && !client.destroyed) {
    return client;
  }

  const authority = getAuthority(userAuthority);
  client = http2.connect(authority);
  client.setTimeout(180000); // 客户端和服务端之间的建立的连接可存在时间：3 minutes

  client.on('close', () => {
    client = null;
    logError('HTTP2 CLIENT CLOSE');
  });

  client.on('error', (err) => {
    closeClient();
    logError('HTTP2 CLIENT ERROR: %o', err);
  });

  client.on('frameError', (type, code, id) => {
    closeClient();
    logError('HTTP2 CLIENT frameError type: %s, code: %s, id: %s', type, code, id);
  });

  client.on('goaway', (errorCode, lastStreamID) => {
    closeClient();
    logError('HTTP2 CLIENT GOAWAY errorCode: %s, lastStreamID: %s', errorCode, lastStreamID);
  });

  client.on('timeout', () => {
    closeClient();
    logError('HTTP2 CLIENT TIMEOUT');
  });

  return client;
}

const {
  HTTP2_HEADER_SCHEME,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_CONNECTION,
  HTTP2_HEADER_UPGRADE,
  HTTP2_HEADER_HOST,
  HTTP2_HEADER_HTTP2_SETTINGS,
  HTTP2_HEADER_KEEP_ALIVE,
  HTTP2_HEADER_PROXY_CONNECTION,
  HTTP2_HEADER_TRANSFER_ENCODING,
  HTTP2_HEADER_TE,
  NGHTTP2_CANCEL,
} = http2.constants;

function isIllegalConnectionSpecificHeader(headerKey, headerValue) {
  const headerKeyLowerCase = headerKey.toLowerCase();
  switch (headerKeyLowerCase) {
    case HTTP2_HEADER_CONNECTION:
    case HTTP2_HEADER_UPGRADE:
    case HTTP2_HEADER_HOST:
    case HTTP2_HEADER_HTTP2_SETTINGS:
    case HTTP2_HEADER_KEEP_ALIVE:
    case HTTP2_HEADER_PROXY_CONNECTION:
    case HTTP2_HEADER_TRANSFER_ENCODING:
      return true;
    case HTTP2_HEADER_TE:
      return headerValue !== 'trailers';
    default:
      return false;
  }
}

function getRequestHeaders(headers) {
  // filter illegal headers
  Object.keys(headers).forEach((key) => {
    if (isIllegalConnectionSpecificHeader(key, headers[key])) {
      // eslint-disable-next-line no-param-reassign
      delete headers[key];
    }
  });

  return headers;
}

function http2Request(params) {
  const {
    protocol,
    hostname,
    // port,
    // path,
    method,
    // headers,
    // body,
    timeout, // 一个请求等待的最大时间
    authority,
  } = params;

  let {
    path,
    headers,
    body,
  } = params;

  let requestHeaders = getRequestHeaders({
    [HTTP2_HEADER_SCHEME]: protocol,
    [HTTP2_HEADER_AUTHORITY]: hostname, // 我认为应该是 HTTP2_HEADER_HOST
    [HTTP2_HEADER_PATH]: path,
    [HTTP2_HEADER_METHOD]: method,
    ...headers,
  });

  if (body) {
    requestHeaders['Content-Length'] = Buffer.byteLength(body);
  }

  const traceId = getTraceId();
  let data = '';
  let handleError;
  let handleTimeout;

  log('[%i] REQ %s', traceId, curlFormatHttp2({
    method,
    hostname,
    path,
    headers,
    authority: getAuthority(authority),
  }, body));

  return new Promise((resolve, reject) => {
    // 创建客户端 http2 会话，并发送请求
    const clientHttp2Session = createClient(authority);
    let req = clientHttp2Session.request(requestHeaders);
    if (body) {
      req.write(body);
    }
    req.setEncoding('utf8');

    // manual garbage collection
    function gc() {
      req.setTimeout(0, handleTimeout);

      if (req.close) {
        log('[%i] REQUEST STREAM CLOSE', traceId);
        req.close(NGHTTP2_CANCEL);
      }

      if (!req.destroyed && req.destroy) {
        log('[%i] REQUEST STREAM DESTROY', traceId);
        req.destroy();
      }
      req.removeAllListeners();

      path = null;
      headers = null;
      body = null;
      requestHeaders = null;
      data = null;
      handleError = null;
      handleTimeout = null;
      req = null;
    }

    handleError = (e) => {
      logError('[%i] REQ ERROR: %o | REQ %s', traceId, e, curlFormatHttp2({
        method,
        hostname,
        path,
        headers,
        authority: getAuthority(authority),
      }, body));

      reject(e);
      gc();
    };

    handleTimeout = () => {
      const e = new Error('timeout');

      logError('[%i] REQ TIMEOUT: %o | REQ %s', traceId, e, curlFormatHttp2({
        method,
        hostname,
        path,
        headers,
        authority: getAuthority(authority),
      }, body));

      reject(e);
      gc();
    };

    req.on('response', (resHeaders, flags) => {
      log('[%i] RES HEADERS: %o', traceId, resHeaders);
      log('[%i] RES FLAGS: %s', traceId, flags);
    });

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      resolve({
        requestHeaders,
        requestBody: body,
        // statusCode: resHeaders[':status'],
        // responseHeaders: getCleanResponseHeaders(resHeaders),
        responseText: data,
        traceId,
      });
      log('[%i] RES END BODY: %s', traceId, getSuitableBody(data, true));
      gc();
    });

    req.setTimeout(timeout, handleTimeout);

    req.on('error', handleError);

    req.end();
  });
}

module.exports = http2Request;
