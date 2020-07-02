const binaryxRequest = require('..');

const initOptions = {
  // http2: 'http://localhost:8443',
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  servers: {
    s1: { host: 'localhost', port: 3000 },
    s2: { host: 'www.baidu.com', protocol: 'https' },
  },
  actions: {
    action1: {
      path: '/',
      server: 's1',
    },
    action2: {
      path: '/',
      server: 's2',
    },
  },
};

binaryxRequest.init(initOptions);

async function request1() {
  const data = await binaryxRequest({
    action: 'action1',
    method: 'GET',
    timeout: 10000, // 测试请求超时
  });
  console.log('request1:', data);
}

async function request2() {
  const data = await binaryxRequest({
    action: 'action2',
    method: 'GET',
    timeout: 10000, // 测试请求超时
  });
  console.log('request2:', data);
}

request1();
request2();
