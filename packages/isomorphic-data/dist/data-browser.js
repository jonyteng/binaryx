"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var axios = require('axios');

var querystring = require('qs');

var origin = '';
var endPoint = '/data/';
var responseFn;
var defaultHeaders = {
  'X-Requested-With': 'XMLHttpRequest'
}; // IE cache

if (/(MSIE|Trident)/.test(navigator.userAgent)) {
  defaultHeaders['Cache-Control'] = 'no-cache';
  defaultHeaders.Pragma = 'no-cache';
}

var dataPromise = function dataPromise(_ref) {
  var url = _ref.url,
      method = _ref.method,
      qs = _ref.qs,
      form = _ref.form,
      json = _ref.json,
      headers = _ref.headers,
      restfulParams = _ref.restfulParams;
  return new Promise(function (reslove, reject) {
    var xhrHeaders = _objectSpread(_objectSpread({}, defaultHeaders), {}, {
      headers: headers
    });

    if (restfulParams) {
      xhrHeaders.Restful = JSON.stringify(restfulParams);
    }

    var data;

    if (form) {
      data = querystring.stringify(form);
      xhrHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    } else if (json) {
      data = json;
      xhrHeaders['Content-Type'] = 'application/json;charset=utf-8';
    }

    axios.requset({
      url: url,
      method: method,
      params: qs,
      data: data,
      withCredentials: true,
      headers: xhrHeaders
    }).then(function (_ref2) {
      var resData = _ref2.data;

      if (responseFn) {
        responseFn(resData);
      }

      reslove(resData);
    })["catch"](function (e) {
      reject(e);
    });
  });
};

function isomorphicData(_ref3) {
  var action = _ref3.action,
      _ref3$method = _ref3.method,
      method = _ref3$method === void 0 ? 'GET' : _ref3$method,
      qs = _ref3.qs,
      form = _ref3.form,
      json = _ref3.json,
      restfulParams = _ref3.restfulParams,
      headers = _ref3.headers;
  var url = origin + endPoint + action;
  return dataPromise({
    url: url,
    method: method,
    qs: qs,
    form: form,
    json: json,
    headers: headers,
    restfulParams: restfulParams
  });
}

isomorphicData.setEndPoint = function (dirname) {
  if (dirname) {
    endPoint = "/".concat(dirname.replace(/^\/|\/$/g, ''), "/");
  }
};

isomorphicData.init = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var initOrigin = options.origin,
      initEndpoint = options.endpoint,
      initResponseFn = options.responseFn,
      headers = options.headers;

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