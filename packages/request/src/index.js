// eslint-disable-next-line no-unused-vars
const redis = null;
const { debugEnabled } = require('@binaryx/debug');
const http2Request = require('./http2Request');
const httpRequest = require('./httpRequest');
const getRequestOptions = require('./getRequestOptions');
const mock = require('./mock');

const log = debugEnabled('@binaryx/request');
const globalOptions = {};

// http1 + http2(网关、后端服务)
// 我们考虑的情况：全部使用 HTTP1.1，或者全部使用HTTP2网关
function useHttp2() {
  const defaultAuthority = process.env.HTTP2_AUTHORITY;

  if (
    (globalOptions.http2 && typeof globalOptions.http2 === 'string')
    || (globalOptions.http2 && defaultAuthority)
  ) {
    return true;
  }

  return false;
}

async function request(opts) {
  let data;

  if (useHttp2(opts.hostname)) {
    data = await http2Request({
      authority: globalOptions.http2,
      ...opts,
    });
  } else {
    data = await httpRequest({
      ...opts,
    });
  }

  return data;
}

async function binaryxRequest({
  action,
  method = 'GET',
  path, // rewrite action's path
  headers,
  qs,
  body,
  json,
  form,
  restfulParams,
  timeout,
  deleteCacheMethod,
}) {
  const actionConfig = globalOptions.actions[action];
  if (!actionConfig) {
    log('Action Not Found: %s', action);
    process.exit(1);
  }

  const serverConfig = globalOptions.servers[actionConfig.server];
  if (!serverConfig) {
    log('Server Config Not Found: %s', actionConfig.server);
    process.exit(1);
  }

  // use mock
  if (globalOptions.isMock && globalOptions.mockDir && actionConfig.mock) {
    const data = await mock(globalOptions.mockDir, actionConfig.mock);
    return data;
  }

  const opts = getRequestOptions(
    {
      action,
      method,
      path,
      headers,
      qs,
      body,
      json,
      form,
      restfulParams,
      timeout,
    },
    actionConfig,
    serverConfig,
    globalOptions,
  );

  // todo:: redis 缓存
  if (
    globalOptions.redisCacheConfig
    && actionConfig.cache
    && actionConfig.cache.expire
  ) {
    // eslint-disable-next-line no-unused-vars
    const cacheConfig = {
      ...actionConfig.cache,
      deleteCacheMethod,
    };

    // eslint-disable-next-line no-unused-vars
    const data = await new Promise((resolve, reject) => {

    });

    return data;
  }

  try {
    const data = await request(opts);

    try {
      return JSON.parse(data.responseText);
    } catch (e) {
      return data.responseText;
    }
  } catch (e) {
    log('RESPONSE ERROR: %o', e);
    throw e;
  }
}

binaryxRequest.init = function init({
  http2 = true,
  redisCacheConfig,
  servers = {},
  headers = {},
  actions = {},
  timeout,
  isMock = false,
  mockDir,
}) {
  globalOptions.http2 = http2;
  globalOptions.servers = servers;
  globalOptions.headers = headers;
  globalOptions.actions = actions;
  globalOptions.timeout = timeout;
  globalOptions.isMock = isMock;
  globalOptions.mockDir = mockDir;

  // todo:: redis 缓存
  if (redisCacheConfig) {
    globalOptions.redisCacheConfig = redisCacheConfig;
  }
};

module.exports = binaryxRequest;
