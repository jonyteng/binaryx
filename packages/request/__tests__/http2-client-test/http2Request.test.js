const http2Request = require('../../src/http2Request');

let count = 0;
let timer = null;
timer = setInterval(async () => {
  const res = await http2Request({
    protocol: 'http',
    hostname: 'localhost',
    port: 8443,
    path: '/',
    method: 'POST',
    headers: {},
    body: 'a=1&b=2',
    timeout: 180000,
    authority: 'http://localhost:8443',
  });

  console.log('res:', res);

  count += 1;
  if (count >= 2) {
    clearInterval(timer);
  }
}, 5000);
