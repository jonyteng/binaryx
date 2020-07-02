# `request`
> 对 NodeJS http(https)/http2 模块的封装。
> 在 Node 中发送请求时，基于环境变量的设置，选择使用 http 或者 http2。

## 应用场景
- http 请求直接发送到后端服务器。
- http2 请求发送到支持http2的网关。
- 暂不支持 http 和 http2 混用。

## Usage
```javascript
const binaryxRequest = require('@binaryx/request');

// configure binaryxRequest
binaryxRequest.init({
  // default http2 authority is process.env.HTTP2_AUTHORITY
  // http2: true, false or url(eg: 'http://web-mesh-gw' or 'http://0.0.0.1'),
  // global default headers
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  servers: {
    s1: {
      host: '0.0.0.0',
      port: 3000,
      headers: {
        // Set default content type here
        // 'Content-Type': 'application/json;charset=utf-8',
        // 'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    s2: {
      host: '0.0.0.1',
      port: 3001,
      headers: {
        // Set default content type here
        // 'Content-Type': 'application/json;charset=utf-8',
        // 'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  },
  actions: {
    test: {
      path: '/quux/xxx',
      server: 's1',
      headers: {
        // Set default content type here
        // 'Content-Type': 'application/json;charset=utf-8',
        // 'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    testRestful: {
      path: '/foo/{r1}/bar/{r2}',
      server: 's2',
      cache: {
        expire: 5000, // cache for 5000 seconds
      },
    },
  }
});

// form,json,body,最多只能设置一个
// http://0.0.0.1:3001/foo/{r1}/bar/{r2}?q1=1&q2=2
// body: 'f1=1&f2=2' or '{"j1":1,"j2":2}' or
binaryxRequest({
  action: 'testRestful',
  method: 'POST', // http method, like POST GET DELETE and so on
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  // query string => ?q1=1&q2=2
  qs: {
    q1: 1,
    q2: 2
  },
  // application/x-www-form-urlencoded body: 'f1=1&f2=2'
  form: {
    f1: 1,
    f2: 2,
  },
  // application/json body: '{"j1":1,"j2":2}'
  json: {
    j1: 1,
    j2: 2
  },
  // body: '{"b1":1,"b2":2}'
  // body param is deprecated
  body: JSON.stringify({
    b1: 1,
    b2: 2,
  }),
  // /foo/{r1}/bar/{r2} =>  /foo/1/bar/2
  restfulParams: {
    r1: '1',
    r2: '2',
  },
})
.then(function (json) {
  res.json(json);
})
.catch(function (e) {
  next(e);
});
```

### redis cache request

```js
const actions = {
  testRestful: {
    path: '/foo/{r1}/bar/{r2}',
    server: 's2',
    cache: {
      compress: true, // 缓存的时候压缩
      expire: 5000, // cache for 5000 seconds
    },
  },
};

binaryxRequest.init({
  servers: servers,
  actions: actions,
  redisCacheConfig: {
    prefix: 'hello:world:redisCacheSetup:',
    host: '127.0.0.1',
    port: 6379,
  }
});

// testing: 不取缓存，但也不清除缓存
// delete: 删除当前接口缓存
// deleteAll: 删除当前项目所有缓存
const deleteCacheMethod = ''; // testing/delete/deleteAll/null

// 返回true是，返回值不做缓存
const noCacheMethod = (data) => {
  if (!data.data.length) {
    // no cache
    return true;
  }

  // will cache
  return false;
}

binaryxRequest({
  action: 'testRestful',
  method: 'POST', // http method, like POST GET DELETE and so on
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  qs: {
    q1: 1,
    q2: 2
  },
  deleteCacheMethod,
  noCacheMethod
})
.then(function (json) {
  res.json(json);
})
.catch(function (e) {
  next(e);
});

```

### pipe 废弃

```js
app.use('/', async (req, res) => {
  const {
    response,
    statusCode,
    responseHeaders,
  } = await binaryxRequest({
    // ... options
    pipe: true,
  });

  response.pipe(res);
});

// or

app.use('/', async (req, res) => {
  const {
    response,
    statusCode,
    responseHeaders,
  } = await binaryxRequest.request({
    method: 'POST',
    hostname: serverConfig.host,
    protocol, // 'http'
    port, // 80
    path: requestPath,
    timeout: 10000,
    headers: myHeaders,
    json: {},
    qs: {},
    restfulParams: {},
    pipe: true,
  });

  response.pipe(res);
});

```


