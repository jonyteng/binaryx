/**
 * http: curl -X GET -H 'Content-Type: application/json;charset=utf-8' 'https://www.baidu.com:443/'
 * http2: curl -X GET -H 'Host: www.baidu.com' -H 'Content-Type: application/json;charset=utf-8' 'http://localhost:8443/'
 * */

const getSuitableBody = require('./get-suitable-body');

function curlFormatHttp({
  hostname,
  protocol,
  port,
  path,
  method,
  headers,
}, body) {
  const arr = [
    'curl',
    '-X',
    method,
  ];

  Object.keys(headers).forEach((key) => {
    arr.push('-H');
    arr.push(`'${key}: ${headers[key]}'`);
  });

  if (body) {
    arr.push('-d');
    arr.push(`$'${getSuitableBody(body)}'`);
  }

  arr.push(`'${protocol}//${hostname}:${port}${path}'`);

  return arr.join(' ');
}

function curlFormatHttp2({
  authority,
  method,
  hostname,
  path,
  headers,
}, body) {
  const arr = [
    'curl',
    '-X',
    method,
  ];

  arr.push('-H');
  arr.push(`'Host: ${hostname}'`);

  if (headers) {
    Object.keys(headers).forEach((key) => {
      arr.push('-H');
      arr.push(`'${key}: ${headers[key]}'`);
    });
  }

  if (body) {
    arr.push('-d');
    arr.push(`$'${getSuitableBody(body)}'`);
  }

  arr.push(`'${authority}${path}'`);

  return arr.join(' ');
}

module.exports = {
  curlFormatHttp,
  curlFormatHttp2,
};
