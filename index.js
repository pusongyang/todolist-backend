// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const request = require('request');

const { accessKeySecret } = require('./aliyunConfig');
// 初始化当前用户
const me = {
  name: '秦粤',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  userid: '00000001',
  email: 'qinyue@me.com',
  signature: '陕西的秦，广东的粤',
  title: '全栈工程师',
  group: '某厂－某事业群－某平台部－某技术部－中台团队',
  tags: [{
    key: '0',
    label: '全栈',
  }],
  notifyCount: 12,
  unreadCount: 11,
  country: 'China',
  geographic: {
    province: {
      label: '浙江省',
      key: '330000',
    },
    city: {
      label: '杭州市',
      key: '330100',
    },
  },
  address: '余杭区某小区',
  phone: '0752-26888xxxx',
};
const ENV = process.env;
const PORT = process.PORT || 3001;
let ruleURL = 'http://localhost:3000/api/rule';
if (ENV.MYAPP_PORT_3001_TCP) {
  ruleURL = 'http://rule.cluster.local/api/rule';
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// 静态资源路由
app.use(express.static('public'));

app.get('/api/currentUser', (req, res) => {
  const jwtToken = jwt.sign({ data: me.name }, accessKeySecret, { expiresIn: '1h' });
  res.cookie('jwtToken', jwtToken);
  res.json(me);
});
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
// app.all('/api/user', (req, res) => {
//   res.json({});
// });

// SPA单页应用，默认加载index.html
app.all("/*", (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync('./public/index.html', 'utf8'));
});

const checkJWT = (req, res) => {
  try {
    jwt.verify(req.cookies.jwtToken, accessKeySecret);
  } catch (err) {
    res.status(403);
    return res.json({
      success: false,
      message: 'JWT token auth failed',
    });
  }
  return true;
};
// 监听PORT端口
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
});
