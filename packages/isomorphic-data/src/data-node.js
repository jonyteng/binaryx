const config = require('./node/config');
const dataPromise = require('./node/data-promise');
const middleware = require('./data-node-middleware');

async function isomorphicData({
  action,
  method = 'GET',
  qs,
  form,
  json,
  restfulParams,
  headers,
}) {
  const data = await dataPromise({
    action,
    method,
    qs,
    form,
    json,
    restfulParams,
    headers,

    handlerDirname: config.handlerDirname,
    transformerDirname: config.transformerDirname,
    actions: config.actions,
    requestFn: config.requestFn,
  });

  return data;
}

isomorphicData.init = ({
  handlerDirname,
  transformerDirname,
  actions,
  backupRequest,
}) => {
  config.handlerDirname = handlerDirname;
  config.transformerDirname = transformerDirname;
  config.actions = actions;
  config.backupRequest = backupRequest;
};

isomorphicData.middleware = middleware;

// blank function for server side render
isomorphicData.setEndPoint = () => {};

module.exports = isomorphicData;
