const path = require('path');
const fileExist = require('./file-exist');

function esModuleResolve(obj) {
  // eslint-disable-next-line no-underscore-dangle
  return obj && obj.__esModule ? obj.default : obj;
}

module.exports = async function getHandler(action, handlerDirname) {
  let handlerExist = false;
  let handlerFilename = action;
  let actionName;

  const slashIndex = action.indexOf('-'); // action 为 'xxx-yyy' 形式
  if (slashIndex !== -1) {
    handlerFilename = action.slice(0, slashIndex);
    actionName = action.slice(slashIndex + 1);
  }

  const handlerPath = path.resolve(handlerDirname, handlerFilename);
  handlerExist = await fileExist(handlerPath);

  if (handlerExist) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const obj = require(handlerPath);

    if (actionName) {
      if (obj[actionName]) {
        return obj[actionName];
      }

      return false;
    }

    return esModuleResolve(obj);
  }

  return false;
};
