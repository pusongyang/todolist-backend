// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const TableStore = require('tablestore');
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');

//监听端口号
const PORT=3001;
const {endpoint, accessKeyId, accessKeySecret, instancename, tableName, primaryKey} = require('./aliyunConfig');

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
  owner: '秦粤',
  callNo: Math.floor(Math.random() * 1000),
  status: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
  progress: 0,
};
let TodoList = [];
// const client = new TableStore.Client({
//   accessKeyId,
//   accessKeySecret,
//   endpoint,
//   instancename,
//   maxRetries:20,//默认20次重试，可以省略这个参数。
// });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// 静态资源路由
app.use(express.static('public'));

app.get('/api/currentUser', (req, resp) => {
  resp.json(me);
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
  res.json({})
  // client.updateRow(params, function (err, data) {
  //   if (err) {
  //     console.log('error:', err);
  //     return;
  //   }
  //   return res.json(newRule);
  // });
});
app.delete('/api/rule',async (req, res) => {
  checkJWT(req, res);
  const body = req.body;
  const { key } = body;
  TodoList = TodoList.filter(item => key.indexOf(item.key) === -1);
  const params = updateTodos(TodoList);
  res.json({})
  // client.updateRow(params, function (err, data) {
  //   if (err) {
  //     console.log('error:', err);
  //     return;
  //   }
  //   const result = {
  //     list: TodoList,
  //     pagination: {
  //       total: TodoList.length,
  //     },
  //   };
  //   return res.json(result);
  // });
});
app.put('/api/rule',async (req, res) => {
  checkJWT(req, res);
  const body = req.body;
  const { name, desc, key, status } = body;
  const target = TodoList.findIndex((todo) => todo.key == key);
  let newRule = { ...TodoList[target], desc, name, status};
  TodoList[target] = newRule;
  const params = updateTodos(TodoList);
  res.json({})
  // client.updateRow(params, function (err, data) {
  //   if (err) {
  //     console.log('error:', err);
  //     return;
  //   }
  //   return res.json(newRule);
  // });
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
//额外进程，事件循环EventLoop同步链表数据库
const params = {
  tableName,
  primaryKey,
  returnContent: { returnType: TableStore.ReturnType.Primarykey }
};

// SPA单页应用，默认加载index.html
app.all("/*", (req, resp) => {
  resp.setHeader('Content-Type', 'text/html');
  resp.send(fs.readFileSync('./public/index.html', 'utf8'));
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  });

// client.getRow(params, function (err, data) {
//   if (err) {
//     console.error('error:', err);
//     return;
//   }
//   TodoList = JSON.parse(data.row.attributes[0].columnValue);
//   // 监听PORT端口
//   app.listen(PORT, () => {
//     console.log(`Example app listening at http://localhost:${PORT}`)
//   });
// });
