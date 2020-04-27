# 极客时间ServerLess专栏，"待办任务"后端项目

这个项目用 Node.js框架[Express.js](http://expressjs.com/en/4x/api.html#express)开发，主要代码在index.js中。
这个仓库是后端项目代码，这个版本TodoList的数据放在内存中。
前端代码放在public目录，由前端仓库[todolist-frontend](https://github.com/pusongyang/todolist-frontend)构建而成。

## 环境准备    
### 安装 Node.js   
1. 浏览器打开Node.js官网：<https://nodejs.org/>
2. 下载LTS版本
3. 安装下载的安装包

### 安装项目Node.js依赖包 `node_modules`:
进入项目的根目录执行：
```bash
npm install
```

or

```bash
yarn
```

## 提供脚本

我们将提供你几个常用脚本，具体脚本放在 `package.json`。

### 启动项目

```bash
npm start
```
启动后，你可以通过浏览器地址栏：<http://127.0.0.1:3001>访问你的本地代码；

# 阿里云配置文件`aliyunConfig`说明
```
//.aliyunConfig文件，保存秘钥，切记不可以上传Git
const endpoint = "https://rule.cn-shanghai.ots.aliyuncs.com";
// AccessKey 阿里云身份验证，在阿里云服务器管理控制台创建
const accessKeyId = "AccessKey";
// SecretKey 阿里云身份验证，在阿里云服务器管理控制台创建
const accessKeySecret = "SecretKey";
// 在数据链表中查看
const instancename = "rule";
const tableName = 'todos';
const primaryKey = [{ 'key': 'list' } ];

module.exports = {endpoint, accessKeyId, accessKeySecret, instancename, tableName, primaryKey};
```
为了获取配置文件中的信息,需要执行如下几部操作.

## 1. 开通阿里云[表格存储]
```
打开 https://ots.console.aliyun.com/ 选择合适的区域,开通服务.
```

## 2. 创建实例及表 (即配置文件中的`instancename`、`tableName`、`primaryKey`)
1. 老师的配置文件的实例名为`rule`
2. 创建表名为`todos`,主键为`key`且是字符串类型. [很重要 否则服务部署好了也无法写入成功]

## 3. 获取实例访问地址 (即配置文件中的`endpoint`)
在`实例访问地址`栏很容易找到该地址. (图省事,可以直接选用`公网`地址.)

## 4. 获取用户`AccessKey`及`SecretKey`
打开[RAM访问控制](https://ram.console.aliyun.com/)
创建一个用户,及赋予`AliyunOTSFullAccess`权限. [很重要 否则服务无权限操作相应库及表]

