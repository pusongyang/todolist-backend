import { Provide, Config } from '@midwayjs/decorator';
import { FaaSConfig } from '../interface';
import { verify } from '../util/jwt';

@Provide('JWTMiddleware')
export class JWTMiddleware {

  @Config()
  aliyunConfig: FaaSConfig['aliyunConfig'];

  resolve() {
    return async (ctx, next) => {
      if(ctx.method === 'GET') {
        await next();
      } else {
        try {
          verify(ctx.cookies.get('jwtToken'), this.aliyunConfig.accessKeySecret);
          await next();
        } catch (err) {
          ctx.status = 403;
          ctx.body = {
            success: false,
            message: 'JWT token auth failed',
          }
        }
      }

    }
  }
}
