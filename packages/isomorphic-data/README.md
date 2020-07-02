# `isomorphic-data`

> 在 NodeJS 和 浏览器中发送请求时，提供统一的调用格式。
> NodeJS 使用 @binaryx/request 发送请求，也可以设置为其它请求工具。
> 浏览器使用 axios 发送请求。
> 对 isomorphic 的理解：同构即一块代码可以同时在 浏览器 和 Node 中运行，底层调用的 api 不同，但是接口定义一致。

## 工作流程
- 浏览器发起请求[data-browser.js] => 进入data-node-middlerware.js => handler/@bianryx/request
- Node 发起请求[data-node.js] => handler/@bianryx/request

## Usage

### 服务端

src/server/index.js
```js
const isomorphicData = require('@binaryx/isomorphic-data');
const binaryxRequest = require('@binaryx/binaryxRequest');

// 由 ./server/handler/*.js 封装一层返回结果
// 或者
// 直接调用 requestFn 返回结果
isomorphicData.init({
  handlerDirname: path.join(__dirname, 'handler'),
  transformerDirname: path.join(__dirname, 'handler/transformer'),
  actions: {
      getAgentProfile: {}
  },
  backupRequest: binaryxRequest,
});

// 监听浏览器端来的请求
app.use('/data/:action', isomorphicData.middleware);
```

### 浏览器

src/clent/app.jsx
```js
import isomorphicData from '@binaryx/isomorphic-data';

isomorphicData.init({
  endPoint: '/data/',
  // global response function
  responseFn: (data) => {
    if (data.code === 'xxxx') {
      window.location.href = '/login';
    }
  },
  // default headers for all ajax
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});
```

### 通用代码：浏览器 或者 Node 端发起请求
src/client/action/test.js

```js
import isomorphicData from '@binaryx/isomorphic-data';

export function actionTest() {
  return async (dispatch) => {
    try {
      // 优先./data/actionTest.js，如果没有找到文件，则使用backupRequest获取数据
      const data = await isomorphicData({
        method: 'POST', // default GET
        action: 'actionTest',
        qs: { name: 1 },
        json: { age: 18, houseId: 1426596, type: 2 }, // json和form不能同时存在
        form: { age: 18 },
        restfulParams: { userId: 123 }, // 具体用法，请看@binaryx/request文档
        headers: { 'Hello-World': 'Man' },
      });

      // 支持同一个data文件写多个action
      await isomorphicData({
        method: 'POST', // default GET
        action: 'actionTest-hello',
        qs: { name: 1 },
        json: { age: 18, houseId: 1426596, type: 2 }, // json和form不能同时存在
        form: { age: 18 },
        headers: { 'Hello-World': 'Man' },
      })
      return data;
    } catch (e) {
      dispatch(internetError(e));
    }
  }
}
```
