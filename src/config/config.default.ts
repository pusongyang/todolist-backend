import { join } from 'path';

export default (appInfo) => {
  /**
   * Static file serve
   *
   * @member Config#static
   * @property {String} prefix - `/public/` by default
   * @property {String} dir - static files store dir, `${baseDir}/app/public` by default
   * @property {Number} maxAge - cache max age, default is 0
   * @see https://github.com/koajs/static-cache
   */
  const staticFile = {
    prefix: '/',
    dir: join(appInfo.baseDir, '../public'),
    dynamic: true,
    preload: false,
    buffer: true,
    maxFiles: 1000,
  };

  const aliyunConfig = {
    // 设置HTTP接入域名（此处以公共云生产环境为例）
    endpoint:"https://rule.cn-shanghai.ots.aliyuncs.com",
    // AccessKey 阿里云身份验证，在阿里云服务器管理控制台创建
    accessKeyId: "accessKeyId",
    // SecretKey 阿里云身份验证，在阿里云服务器管理控制台创建
    accessKeySecret: "accessKeySecret",
    instancename: "rule"
  };

  const keys = '123455';

  const cookies = {
    secure: false,
    keys
  };

  const middleware = ['staticFile', 'cookies'];

  return {
    staticFile,
    aliyunConfig,
    keys,
    cookies,
    middleware
  };
};
