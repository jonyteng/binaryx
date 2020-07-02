let traceId = -1;

module.exports = function getTraceId() {
  traceId += 1;

  if (traceId === Infinity) {
    traceId = 0;
  }

  return traceId;
};
