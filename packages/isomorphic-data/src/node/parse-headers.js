const extraKeysDefault = [
  'content-length',
  'host',
  'accept-encoding',
  'connection',
  'pragma',
  'cache-control',
  'restful',
];

const extraKeysPipe = [
  'content-length',
  'host',
  'accept-encoding',
  'connection',
  'pragma',
  'cache-control',
  'restful',
];

module.exports = function parseHeaders(rawHeaders, pipe) {
  let extraKeys = extraKeysDefault;

  if (pipe) {
    extraKeys = extraKeysPipe;
  }

  const headers = {};
  rawHeaders.forEach((key, index) => {
    if (index % 2 === 0 && !extraKeys.includes(key.toLowerCase())) {
      headers[key] = rawHeaders[index + 1];
    }
  });

  return headers;
};
