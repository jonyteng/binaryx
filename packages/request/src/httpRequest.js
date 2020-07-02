const http = require('http');
const https = require('https');
const { debug, debugEnabled } = require('@binaryx/debug');
const getTraceId = require('./get-trace-id');
const { curlFormatHttp } = require('./curl-format');
const getSuitableBody = require('./get-suitable-body');
// eslint-disable-next-line no-unused-vars
const { getCleanRequestHeaders, getCleanResponseHeaders } = require('./get-clean-headers');

const log = debug('@binaryx/request:HTTP/1');
const logError = debugEnabled('@binaryx/request:HTTP/1');

function httpRequest(params) {
  const {
    protocol,
    hostname,
    port,
    path,
    method,
    headers,
    body,
    timeout,
  } = params;

  const requestOptions = {
    protocol: `${protocol}:`,
    hostname,
    port,
    path,
    method,
    headers: {
      ...headers,
    },
  };
  if (body) {
    requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
  }

  let myHttp = http;
  if (protocol === 'https') {
    myHttp = https;
  }

  const traceId = getTraceId();
  log('[%i] REQ %s', traceId, curlFormatHttp(requestOptions, body));

  return new Promise((resolve, reject) => {
    const req = myHttp.request(requestOptions, (res) => {
      log('[%i] RES STATUS: %d', traceId, res.statusCode);
      log('[%i] RES HEADERS: %o', traceId, res.headers);

      res.setEncoding('utf8');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          requestOptions,
          requestBody: body,
          statusCode: res.statusCode,
          responseHeaders: getCleanResponseHeaders(res.headers),
          responseText: data,
          traceId,
        });

        log('[%i] RES END BODY: %s', traceId, getSuitableBody(data, true));
      });
    });

    req.on('error', (e) => {
      logError('[%i] REQ ERROR: %o | %o | %o', traceId, e, requestOptions, body);
      reject(e);
    });

    req.on('socket', (socket) => {
      socket.setTimeout(timeout);
      socket.on('timeout', () => {
        const e = new Error('timeout');
        logError('[%i] REQ TIMEOUT: %o | %o | %o', traceId, e, requestOptions, body);
        req.abort();
      });
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

module.exports = httpRequest;
