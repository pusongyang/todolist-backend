// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const request = require('request');

const { accessKeySecret } = require('./aliyunConfig');
const env = process.env;
const PORT = 3001;
let ruleURL = 'http://localhost:3000/api/rule';
let userURL = 'http://localhost:3002';
if (env.isKNative === 'true') {
  ruleURL = 'http://rule.default.svc.cluster.local/api/rule';
  userURL = 'http://user.default.svc.cluster.local';
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// 静态资源路由
app.use(express.static('public'));

app.all('/api/rule', (req, res) => {
  // checkJWT(req, res);
  if (req.method === 'PUT') {
    request.put(ruleURL, {form: req.body}).pipe(res);
  } else if (req.method === 'POST') {
    request.post(ruleURL, {form: req.body}).pipe(res);
  } else if (req.method === 'DELETE') {
    request.del(ruleURL, {form: req.body}).pipe(res);
  } else {
    request.get(ruleURL).pipe(res);
  }
});

app.get('/api/currentUser', (req, res) => {
  // TODO:: const id = checkJWT(req, res);
  // request.get(`${userURL}/user/${id}`).pipe(res);
  request.get(`${userURL}/user/1`).pipe(res);
});
app.post('/api/login/account', (req, res) => {
  request.post(userURL+req.path, {form: req.body}).pipe(res);
});
app.post('/user/register', (req, res) => {
  request.post(userURL+req.path, {form: req.body}).pipe(res);
});
app.get('/api/users', (req, res) => {
  request.get(userURL+req.path, {form: req.body}).pipe(res);
});

// SPA单页应用，默认加载index.html
app.all("/*", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync('./public/index.html', 'utf8'));
});

const checkJWT = (req, res) => {
  let jwtDecode;
  try {
    jwtDecode = jwt.verify(req.cookies.jwtToken, accessKeySecret);
  } catch (err) {
    res.status(403);
    return res.json({
      success: false,
      message: 'JWT token auth failed',
    });
  }
  return jwtDecode;
};
// 监听PORT端口
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
});
