import { Func, Inject, Provide, Config } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import * as jwt from 'jsonwebtoken';

import { RuleService } from '../service/rule';
import { FaaSConfig } from '../interface';

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

@Provide()
export class APIFaaSService {

  @Inject()
  ctx: FaaSContext;  // context

  @Inject()
  ruleService: RuleService;

  @Config()
  aliyunConfig: FaaSConfig['aliyunConfig'];

  @Func('api.currentUser')
  async currentUser() {
    const jwtToken = jwt.sign({ data: me.name }, this.aliyunConfig.accessKeySecret, { expiresIn: '1h' });
    (this.ctx as any).cookies.set('jwtToken', jwtToken);
    return me;
  }

  @Func('api.rule', { middleware: [ 'JWTMiddleware']})
  async rule() {
    const method = this.ctx.method;
    if(method === 'GET') {
      const { current = 1, pageSize = 10 } = this.ctx.query;
      return this.ruleService.getRule(current, pageSize);
    } else if( method === 'POST') {
      const { name, desc } = this.ctx.request.body;
      return this.ruleService.postRule(name, desc);
    } else if( method === 'DELETE') {
      const { key } = this.ctx.request.body;
      return this.ruleService.delRule(key);
    } else if( method === 'PUT') {
      const { name, desc, key, status } = this.ctx.request.body;
      return this.ruleService.putRule(name, desc, key, status);
    }
  }

}
