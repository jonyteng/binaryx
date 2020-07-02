const debug = require('debug');
// const io = require('@pm2/io');

function debugEnabled(namespace) {
  const namespaceDebug = debug(namespace);
  namespaceDebug.enabled = true;

  return function log(...args) {
    namespaceDebug(...args);
  };
}

module.exports = debug;
exports = debug;
exports.debug = debug;
exports.debugEnabled = debugEnabled;
