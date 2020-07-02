const fs = require('fs');

const fsAccessCache = {};

module.exports = function fileExist(handlerPath) {
  return new Promise((resolve) => {
    if (handlerPath in fsAccessCache) {
      resolve(fsAccessCache[handlerPath]);
      return;
    }

    fs.access(`${handlerPath}.js`, fs.constants.F_OK, (err) => {
      const exist = !err;
      if (process.env.NODE_ENV === 'production') {
        fsAccessCache[handlerPath] = exist;
      }
      resolve(exist);
    });
  });
};
