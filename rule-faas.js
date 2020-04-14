//部署阿里云函数服务，入口文件rule-faas.handler
const { Server } = require('@webserverless/fc-express');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TableStore = require('tablestore');
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const {endpoint, accessKeyId, accessKeySecret, instancename, tableName, primaryKey} = require('./aliyunConfig');

const defaultRule = {
  href: 'https://ant.design',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
  owner: '秦粤',
  callNo: Math.floor(Math.random() * 1000),
  status: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
  progress: 0,
};
let TodoList = [];
const client = new TableStore.Client({
  accessKeyId,
  accessKeySecret,
  endpoint,
  instancename,
  maxRetries:20,//默认20次重试，可以省略这个参数。
});
function updateTodos(data) {
  const params = {
    tableName,
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    primaryKey,
    updateOfAttributeColumns: [
      { 'PUT': [{ 'data': JSON.stringify(data) }] },
    ]
  };
  return params;
}
// (async () => {
//   return await initTodos();
// })();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/api/rule', (req, res) => {
  const { current = 1, pageSize = 10 } = req.query;
  const result = {
    data: TodoList,
    total: TodoList.length,
    success: true,
    pageSize,
    current: current || 1,
  };
  res.json(result);
});
app.post('/api/rule',async (req, res) => {
  checkJWT(req, res);
  const body = req.body;
  const { name, desc } = body;
  let newRule = { ...defaultRule, key: v4(), name, desc };
  TodoList.unshift(newRule);
  const params = updateTodos(TodoList);
  client.updateRow(params, function (err, data) {
    if (err) {
      console.log('error:', err);
      return;
    }
    return res.json(newRule);
  });
});
app.delete('/api/rule',async (req, res) => {
  checkJWT(req, res);
  const body = req.body;
  const { key } = body;
  TodoList = TodoList.filter(item => key.indexOf(item.key) === -1);
  const params = updateTodos(TodoList);
  client.updateRow(params, function (err, data) {
    if (err) {
      console.log('error:', err);
      return;
    }
    const result = {
      list: TodoList,
      pagination: {
        total: TodoList.length,
      },
    };
    return res.json(result);
  });
});
app.put('/api/rule',async (req, res) => {
  checkJWT(req, res);
  const body = req.body;
  const { name, desc, key, status } = body;
  const target = TodoList.findIndex((todo) => todo.key == key);
  let newRule = { ...TodoList[target], desc, name, status};
  TodoList[target] = newRule;
  const params = updateTodos(TodoList);
  client.updateRow(params, function (err, data) {
    if (err) {
      console.log('error:', err);
      return;
    }
    return res.json(newRule);
  });
});

// 默认路由
app.all("/*", (req, resp) => {
  return resp.json(TodoList);
});
// 阿里云FaaS部署
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
const server = new Server(app);
module.exports.handler = function(req, res, context) {
  server.httpProxy(req, res, context);
};
//额外进程，事件循环EventLoop同步链表数据库
const syncDBPromise = () => {
  const params = {
    tableName,
    primaryKey,
    returnContent: { returnType: TableStore.ReturnType.Primarykey }
  };
  return new Promise((resolve, reject) => {
    client.getRow(params, function (err, data) {
      if (err) {
        reject('error:', err);
        return;
      }
      resolve(data);
    });
  })
}
function syncDB() {
  syncDBPromise().then(data => {
      TodoList = JSON.parse(data.row.attributes[0].columnValue);
    }
  ).catch( err => {
    TodoList = [];
  });
  // setTimeout(syncDB, 1000);
}
syncDB();
