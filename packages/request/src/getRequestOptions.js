const url = require('url');
const querystring = require('querystring');
const { debugEnabled } = require('@binaryx/debug');

const logError = debugEnabled('@binaryx/request:options');
const { getCleanRequestHeaders } = require('./get-clean-headers');

function getRequestOptions(
  {
    path,
    restfulParams,
    method = 'GET',
    timeout,
    body,
    json,
    form,
    qs,
    headers,
  },
  actionConfig,
  serverConfig,
  globalOptions,
) {
  let requestPath = path || actionConfig.path;
  let port = serverConfig.port || 80;
  const protocol = serverConfig.protocol || 'http';

  if (restfulParams) {
    Object.keys(restfulParams).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(restfulParams, key)) {
        requestPath = requestPath.replace(
          `{${key}}`,
          encodeURIComponent(restfulParams[key]),
        );
      }
    });
  }

  if (protocol === 'http' && !serverConfig.port) {
    port = 80;
  } else if (protocol === 'https' && !serverConfig.port) {
    port = 443;
  }

  let httpBody;
  if (body) {
    httpBody = body;
  } else if (json) {
    httpBody = JSON.stringify(json);
  } else if (form) {
    httpBody = querystring.stringify(form);
  }

  if (method === 'GET' || method === 'DELETE') {
    if (httpBody) {
      logError('REQ WARN: DONT USE BODY IN GET AND DELETE METHOD');
    }
    httpBody = undefined;
  }

  if (qs) {
    const myURL = url.parse(requestPath, true);
    const { query, pathname } = myURL;
    Object.keys(qs).forEach((key) => {
      query[key] = qs[key];
    });
    requestPath = `${pathname}?${querystring.stringify(query)}`;
  }

  const myHeaders = {
    ...globalOptions.headers,
    ...serverConfig.headers,
    ...actionConfig.headers,
    ...headers,
  };

  return {
    method: method || 'GET',
    protocol,
    hostname: serverConfig.host,
    port,
    path: requestPath,
    headers: getCleanRequestHeaders(myHeaders),
    body: httpBody,
    timeout: timeout || actionConfig.timeout
    || serverConfig.timeout || globalOptions.timeout || 10000,
  };
}

module.exports = getRequestOptions;
