const http = require('http');

const myRes = {
  text: {
    type: 'text/plain',
    content: '<h1>你好世界</h1>',
  },
  json: {
    type: 'application/json',
    content: JSON.stringify({ a: 1, b: 2 }),
  },
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200, { 'Content-Type': myRes.json.type });
  res.end(myRes.json.content);
});

server.listen(3000);
