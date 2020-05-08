import { Func, Inject, Provide, Config } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import { UserService } from '../service/user';
import { sign } from '../util/jwt';
import { FaaSConfig } from '../interface';

@Provide()
export class UserFaaSService {

  @Inject()
  ctx: FaaSContext;  // context

  @Inject()
  userService: UserService;

  @Config()
  aliyunConfig: FaaSConfig['aliyunConfig'];

  @Func('user.get')
  async getUser() {
    const idx = (this.ctx as any).params.id;
    const user = await this.userService.getUser(idx);
    return user;
  }

  @Func('user.list')
  async listUser() {
    return this.userService.getUsers();
  }

  @Func('user.register')
  async registerUser() {
    const body = this.ctx.request.body;
    if(!body.userName || !body.password){
      return {
        status: 500,
        error: 'invalid params',
        message: 'invalid params',
      }
    }

    const result = await this.userService.register(body.userName, body.password);
    if(result.success) {
      return {
        status: 'ok',
        type: '',
        currentAuthority: body.userName
      }
    } else {
      return {
        status: 500,
        error: 'system error',
        message: result.msg
      }
    }
  }

  @Func('user.login')
  async login() {
    const body = this.ctx.request.body;
    if(!body.userName || !body.password){
      return {
        status: 500,
        error: 'invalid params',
        message: 'invalid params',
      }
    }
    const result = await this.userService.login(body.userName, body.password);
    if(result && result !== -1) {
      const token = sign({id: result}, this.aliyunConfig.accessKeySecret);
      (this.ctx as any).cookies.set('jwtToken', token, { expires: new Date(Date.now() + 15*60*1000), httpOnly: true })
      return {
        status: 'ok',
        type: body.type,
        currentAuthority: 'admin',
      };
    } else {
      return {
        status: 'error',
        type: body.type,
        currentAuthority: 'guest',
      };
    }
  }

}