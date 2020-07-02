function getCleanRequestHeaders(headers) {
  const requestHeaders = {
    ...headers,
  };

  const lowercaseKeyMap = {};

  Object.keys(requestHeaders).forEach((key) => {
    const lowercaseKey = key.toLowerCase();
    const duplicateRawKey = lowercaseKeyMap[lowercaseKey];

    // delete undefined options for http2
    if (requestHeaders[key] === undefined) {
      delete requestHeaders[key];
    } else if (duplicateRawKey) {
      // 删除重复的key
      delete requestHeaders[duplicateRawKey];
      lowercaseKeyMap[lowercaseKey] = key;
    } else {
      lowercaseKeyMap[lowercaseKey] = key;
    }
  });

  return requestHeaders;
}

function getCleanPipeHeaders(headers) {
  const cleanHeaders = {
    ...headers,
  };
  delete cleanHeaders[':status'];
  delete cleanHeaders.server;
  delete cleanHeaders['x-envoy-upstream-service-time'];
  delete cleanHeaders.connection;
  return cleanHeaders;
}

module.exports = {
  getCleanRequestHeaders,
  getCleanResponseHeaders: getCleanPipeHeaders,
};
