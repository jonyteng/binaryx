#!/usr/bin/env node

const http2 = require('http2');
// const fs = require('fs');
// const path = require('path');
// eslint-disable-next-line no-unused-vars
const { res1, res2 } = require('./http2-server-response');

// console.log(path.resolve('./localhost-privkey.pem'));
// console.log(__dirname);

/**
 * 由于没有已知的浏览器支持未加密的 HTTP/2，因此在与浏览器客户端进行通信时必须使用 http2.createSecureServer()。
 * */
// const server = http2.createSecureServer({
//   key: fs.readFileSync(`${__dirname}/localhost-privkey.pem`),
//   cert: fs.readFileSync(`${__dirname}/localhost-cert.pem`)
// });

const server = http2.createServer();
server.on('stream', (stream, headers) => {
  // 测试服务端响应超时
  setTimeout(() => {
    console.log('server headers: ', headers);

    // 流是一个双工流
    stream.respond({
      'content-type': 'text/html',
      ':status': 200,
    });
    stream.end(res1);
  }, 0);
});

server.on('error', (err) => console.error(err));

server.listen(8443);
