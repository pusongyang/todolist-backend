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
