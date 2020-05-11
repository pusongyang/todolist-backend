// 阿里云FaaS部署，从'@webserverless/fc-express'获取Server对象
const { Server } = require('@webserverless/fc-express');
// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
//用于本地文件存储数据库
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory');
const adapter = new Memory('db.json');
const db = low(adapter);

// 初始化待办任务数据
const todos = {
  key: 1,
  disabled: false,
  href: 'https://ant.design',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
  name: `来自后端的你`,
  owner: '秦粤',
  desc: '这是一段描述',
  callNo: 18890992445,
  status: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
  progress: 0,
};
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
const defaultRule = {
  href: 'https://ant.design',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
  owner: me.name,
  callNo: Math.floor(Math.random() * 1000),
  status: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
  progress: 0,
};
db.defaults({ todos: [todos], user: me }).write();

const app = express();
// 静态资源路由
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 后端服务路由
app.get('/api/rule', (req, resp) => {
  const { current = 1, pageSize = 10 } = req.query;
  const todos = db.get('todos').value();
  const result = {
    data: todos,
    total: todos.length,
    success: true,
    pageSize,
    current: current || 1,
  };
  resp.json(result);
});
app.post('/api/rule', (req, res) => {
  const body = req.body;
  const { name, desc } = body;
  let newRule;
  const newKey = db.get('todos').value().length + 1;
  newRule = { ...defaultRule, key: newKey, name, desc };
  db.get('todos')
    .push(newRule)
    .write();
  return res.json(newRule);
});
app.delete('/api/rule', (req, res) => {
  const body = req.body;
  const { key } = body;
  const todos = db.get('todos').value();
  const newTodos = todos.filter(item => key.indexOf(item.key) === -1);
  db.set('todos', newTodos)
    .write();
  const result = {
    list: todos,
    pagination: {
      total: todos.length,
    },
  };
  res.json(result);
});
app.put('/api/rule', (req, res) => {
  const body = req.body;
  const { name, desc, key, status } = body;
  let newRule;
  newRule = db.get('todos')
  .find({ key: key })
  .assign({ desc, name, status})
  .write();
  return res.json(newRule);
});
app.get('/api/currentUser', (req, resp) => {
  resp.json(me);
});

// SPA单页应用，默认加载index.html
app.all("/*", (req, resp) => {
  resp.setHeader('Content-Type', 'text/html');
  resp.send(fs.readFileSync('./public/index.html', 'utf8'));
});
// 阿里云FaaS部署
const server = new Server(app);
module.exports.handler = function(req, res, context) {
  server.httpProxy(req, res, context);
};
