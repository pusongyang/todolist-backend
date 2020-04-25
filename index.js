// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { findIndex,omit } = require('lodash');

//监听端口号
const PORT=3001;
const {endpoint, accessKeyId, accessKeySecret, instancename, tableName, primaryKey} = require('./aliyunConfig');
const MD5_String = "2340b7c9a63b3";

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

/*****   user apis ********/
app.get('/api/currentUser', (req, resp) => {
  resp.json(me);
});

app.get('/api/users', (req, resp) => {
  checkJWT(req, resp);
  const params = {
    tableName:'user',
    primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
    returnContent: { returnType: TableStore.ReturnType.Primarykey }
  };
  client.getRow(params, function (err, data) {
    if (err) {
      console.error('error:', err);
      return;
    }
    try {
      let users = JSON.parse(data.row.attributes[0].columnValue);
      users = omit(users,['password'])
      resp.json(users);
    } catch (error) {
      resp.json([]);
    }
    
  });
});

app.post('/api/register', (req, resp) => {
  const body = req.body;
  if(!body.userName || !body.password){
    return resp.json({
      status: 500,
      error: 'invalid params',
      message: 'invalid params',
    });
  }
  const params = {
    tableName:'user',
    primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
    returnContent: { returnType: TableStore.ReturnType.Primarykey }
  };
  
  client.getRow(params, function (err, data) {
    if (err) {
      console.error('error:', err);
      return;
    }
    let users = [];
    try {
      users = JSON.parse(data.row.attributes[0].columnValue);
      const existUser = findIndex(users,{name:body.userName});
      if(existUser === -1){
        users.push({
          "key":v4(),
          "name": body.userName,
          "password": md5(`PW_${body.password}_${MD5_String}`),
        });
      }else{
        return resp.json({
          status: 500,
          error: 'userName exist',
          message: 'userName exist',
        });
      }
    } catch (error) {
      return resp.json({
        status: 500,
        error: 'system error',
        message: 'system error',
      });
    }
    const params = updateUsers(users);
    client.updateRow(params, function (err, data) {
      if (err) {
        console.log('error:', err);
        return;
      }
      return resp.json({
        status: 'ok',
        type: '',
        currentAuthority: body.userName
      });
    });
    
  });
});

app.post('/api/login/account', (req, resp) => {
  const body = req.body;
  if(!body.userName || !body.password){
    return resp.json({
      status: 500,
      error: 'invalid params',
      message: 'invalid params',
    });
  }
  const params = {
    tableName:'user',
    primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
    returnContent: { returnType: TableStore.ReturnType.Primarykey }
  };
  client.getRow(params, function (err, data) {
    if (err) {
      console.error('error:', err);
      return;
    }
    const findUser = {
      "name": body.userName,
      "password": md5(`PW_${body.password}_${MD5_String}`),
    };
    try {
      const users = JSON.parse(data.row.attributes[0].columnValue);
      const flag = findIndex(users,findUser);
      if(flag !== -1){
        generateJWT(omit(users[flag],'password'),resp);
        return resp.json({
          status: 'ok',
          type,
          currentAuthority: 'admin',
        })
      }
    } catch (error) {
      console.error('error:', error);
    }
    resp.json({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
    
  });
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

function updateUsers(data) {
  const params = {
    tableName:"user",
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
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

const generateJWT = (data,res) =>{
  const token = jwt.sign(data,accessKeySecret);
  res.cookie('jwtToken', token, { expires: new Date(Date.now() + 15*60*1000), httpOnly: true })
}
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

client.getRow(params, function (err, data) {
  if (err) {
    console.error('error:', err);
    return;
  }
  TodoList = JSON.parse(data.row.attributes[0].columnValue);
  // 监听PORT端口
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  });
});
