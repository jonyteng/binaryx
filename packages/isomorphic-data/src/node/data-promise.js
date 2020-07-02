const getHandler = require('./get-handler');

module.exports = async function dataPromise({
  action,
  method,
  qs,
  form,
  json,
  restfulParams,
  headers,

  handlerDirname,
  transformerDirname,
  actions,
  requestFn,

  req,
  res,
}) {
  let handler = await getHandler(action, handlerDirname);
  const transformer = await getHandler(action, transformerDirname);

  if (handler === false) {
    if (actions[action] && requestFn) {
      handler = requestFn;
    } else {
      console.error('\x1b[41m\x1b[37m%s\x1b[0m', `@binaryx/isomorphic-data: Action ${action} not exist!`);
    }
  }

  // 由 ./server/handler/*.js 封装一层返回结果
  // 或者
  // 直接调用 requestFn 返回结果
  const data = await handler({
    action,
    method,
    qs,
    form,
    json,
    restfulParams,
    headers,

    req,
    res,
  });

  if (data && transformer) {
    return transformer(data);
  }

  return data;
};
