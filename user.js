// 主进程代码
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { findIndex,omit } = require('lodash');
const TableStore = require('tablestore');

const {endpoint, accessKeyId, accessKeySecret, instancename} = require('./aliyunConfig');
const MD5_String = "2340b7c9a63b3";
const params = {
  tableName:'user',
  primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
  returnContent: { returnType: TableStore.ReturnType.Primarykey }
};
const env = process.env;
const PORT = 3002;

// 初始化当前用户
const meDefault = {
  name: (env.version === 'v1') ? '秦粤' : '粤秦D',
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
const client = new TableStore.Client({
  accessKeyId,
  accessKeySecret,
  endpoint,
  instancename,
  maxRetries:20,//默认20次重试，可以省略这个参数。
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// 静态资源路由
app.use(express.static('public'));

/*****   user apis ********/
app.get('/user/:id', (req, resp) => {
  client.getRow(params, function (err, data) {
    if (err) {
      return resp.json({
        status: 500,
        error: err,
        message: 'invalid params',
      });
    }
    const users = JSON.parse(data.row.attributes[0].columnValue);
    const idx = req.params.id;
    if (users[idx]) {
      const { name } = users[idx];
      const me = {...meDefault, name: name};
      resp.json(me);
    } else {
      resp.json(meDefault);
    }
  });
});

app.get('/api/users', (req, resp) => {
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

app.post('/user/register', (req, resp) => {
  const body = req.body;
  if(!body.userName || !body.password){
    return resp.json({
      status: 500,
      error: 'invalid params',
      message: 'invalid params',
    });
  }

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
        generateJWT({id: flag},resp);
        return resp.json({
          status: 'ok',
          type: body.type,
          currentAuthority: 'admin',
        })
      }
    } catch (error) {
      console.error('error:', error);
    }
    resp.json({
      status: 'error',
      type: body.type,
      currentAuthority: 'guest',
    });

  });
});

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

const generateJWT = (data,res) =>{
  const token = jwt.sign(data,accessKeySecret);
  res.cookie('jwtToken', token, { expires: new Date(Date.now() + 15*60*1000), httpOnly: true })
}

// 监听PORT端口
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
});
