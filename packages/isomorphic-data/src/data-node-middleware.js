const dataPromise = require('./node/data-promise');
const parseHeaders = require('./node/parse-headers');
const config = require('./node/config');

async function middleware(req, res, next) {
  const { params: { action }, query, body: requestBody } = req;
  const headers = parseHeaders(req.rawHeaders, true);
  const { restful, 'content-type': contentType } = req.headers;

  let body = Object.keys(requestBody).length === 0 ? undefined : requestBody;
  const qs = Object.keys(query).length === 0 ? undefined : query;
  let form;
  let json;

  if (contentType) {
    if (contentType.indexOf('application/json') !== -1) {
      json = body;
      body = undefined;
    } else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
      form = body;
      body = undefined;
    } else if (typeof body === 'object') {
      json = body;
      body = undefined;
    }
  }

  if (req.method === 'GET') {
    body = undefined;
    form = undefined;
    json = undefined;
  }

  let restfulParams;
  if (restful) {
    try {
      restfulParams = JSON.parse(restful);
    } catch (e) {
      console.log(e);
    }
  }

  try {
    const data = await dataPromise({
      action,
      method: req.method,
      qs,
      form,
      json,
      restfulParams,
      headers,

      handlerDirname: config.handlerDirname,
      transformerDirname: config.transformerDirname,
      actions: config.actions,
      requestFn: config.requestFn,

      req,
      res,
    });

    // do nothing when false
    if (data === false) {
      return;
    }

    const {
      REQUEST_PIPE,
      response,
      statusCode,
      responseHeaders,
    } = data;

    if (REQUEST_PIPE === true) {
      res.status(statusCode);
      res.set(responseHeaders);
      response.pipe(res);
    } else {
      res.json(data);
    }
  } catch (e) {
    next(e);
  }
}

module.exports = middleware;
