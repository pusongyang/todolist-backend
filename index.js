// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
//监听端口号
const PORT=3001;

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

const app = express();
// 静态资源路由
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/currentUser', (req, resp) => {
  resp.json(me);
});

// SPA单页应用，默认加载index.html
app.all("/*", (req, resp) => {
  resp.setHeader('Content-Type', 'text/html');
  resp.send(fs.readFileSync('./public/index.html', 'utf8'));
});

// 监听PORT端口
app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`))
