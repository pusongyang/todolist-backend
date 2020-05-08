import { Provide, ScopeEnum, Scope, Config } from '@midwayjs/decorator';
import * as Cookies from 'cookies';
const COOKIES = Symbol('context#cookies');

@Provide('cookies')
@Scope(ScopeEnum.Singleton)
export class CookieMiddleware {
  @Config('cookies')
  cookiesConfig: {
    keys: string;
    secure: boolean;
  };

  resolve() {
    const self = this;
    return async (ctx, next) => {
      if (!ctx.cookies) {
        Object.defineProperty(ctx, 'cookies', {
          get: function () {
            if (!ctx[COOKIES]) {
              const resProxy = new Proxy(ctx.res, {
                get(obj, prop) {
                  // 这里屏蔽 set 方法，是因为 cookies 模块中根据这个方法获取 setHeader 方法
                  if (prop !== 'set') {
                    return obj[prop];
                  }
                },
              });
              ctx[COOKIES] = new Cookies(ctx.req as any, resProxy as any, {
                keys: self.cookiesConfig.keys,
                secure: self.cookiesConfig.secure,
              });
            }
            return ctx[COOKIES];
          },
        });
      }
      await next();
    };
  }
}
