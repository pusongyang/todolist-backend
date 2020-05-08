import { Provide } from '@midwayjs/decorator';

@Provide('homeMiddleware')
export class HomeMiddleware {

  resolve() {
    return async (ctx, next) => {
      if (ctx.method === 'GET' && ctx.path === '/') {
        ctx.path = '/index.html';
      }
      await next();
    }
  }
}
