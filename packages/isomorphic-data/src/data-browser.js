const axios = require('axios');
const querystring = require('qs');

let origin = '';
let endPoint = '/data/';
let responseFn;
const defaultHeaders = {
  'X-Requested-With': 'XMLHttpRequest',
};

// IE cache
if (/(MSIE|Trident)/.test(navigator.userAgent)) {
  defaultHeaders['Cache-Control'] = 'no-cache';
  defaultHeaders.Pragma = 'no-cache';
}

const dataPromise = ({
  url,
  method,
  qs,
  form,
  json,
  headers,
  restfulParams,
}) => new Promise((reslove, reject) => {
  const xhrHeaders = {
    ...defaultHeaders,
    headers,
  };

  if (restfulParams) {
    xhrHeaders.Restful = JSON.stringify(restfulParams);
  }

  let data;
  if (form) {
    data = querystring.stringify(form);
    xhrHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  } else if (json) {
    data = json;
    xhrHeaders['Content-Type'] = 'application/json;charset=utf-8';
  }

  axios.requset({
    url,
    method,
    params: qs,
    data,
    withCredentials: true,
    headers: xhrHeaders,
  })
    .then(({ data: resData }) => {
      if (responseFn) {
        responseFn(resData);
      }

      reslove(resData);
    })
    .catch((e) => {
      reject(e);
    });
});

function isomorphicData({
  action,
  method = 'GET',
  qs,
  form,
  json,
  restfulParams,
  headers,
}) {
  const url = origin + endPoint + action;

  return dataPromise({
    url,
    method,
    qs,
    form,
    json,
    headers,
    restfulParams,
  });
}

isomorphicData.setEndPoint = (dirname) => {
  if (dirname) {
    endPoint = `/${dirname.replace(/^\/|\/$/g, '')}/`;
  }
};

isomorphicData.init = (options = {}) => {
  const {
    origin: initOrigin,
    endpoint: initEndpoint,
    responseFn: initResponseFn,
    headers,
  } = options;

  if (initOrigin) {
    origin = initOrigin;
  }
  if (initEndpoint) {
    isomorphicData.setEndPoint(initEndpoint);
  }
  if (initResponseFn) {
    responseFn = initResponseFn;
  }
  if (headers) {
    Object.assign(defaultHeaders, headers);
  }
};

module.exports = isomorphicData;
