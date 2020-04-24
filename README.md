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


# 阿里云环境部署参考
## 0. 准备工作
* [安装阿里云的命令行工具fun](https://help.aliyun.com/document_detail/161136.html)
* [配置工具的授权](https://help.aliyun.com/document_detail/146702.html)
## 1. 克隆代码仓库
## 2. 替换函数计算用到的文件
```
cp index-faas.js index.js
```
## 3. 安装依赖
```
fun install
```
## 4. 部署服务上阿里云
```
fun deploy
```
## 5. 在阿里云上配置自定义域名及路由
```
https://fc.console.aliyun.com/
需要具备已备案的域名
路由的路径设置需要配置成: /* 
```
## 6. 验证效果

