import { Configuration, Plugin, Config } from '@midwayjs/decorator';
import { FC, IMidwayContainer } from '@midwayjs/faas';
import * as TableStore from 'tablestore';
import { FaaSConfig } from './interface';

@Configuration({
  importConfigs: [
    './config'
  ],
})
export class ContainerConfiguration {

  @Config()
  aliyunConfig: FaaSConfig['aliyunConfig'];

  @Plugin()
  initializeContext: FC.InitializeContext;

  async onReady(container: IMidwayContainer) {

    const client = new TableStore.Client({
      accessKeyId: this.aliyunConfig.accessKeyId,
      accessKeySecret: this.aliyunConfig.accessKeySecret,
      endpoint: this.aliyunConfig.endpoint,
      instancename: this.aliyunConfig.instancename,
      maxRetries: 20, //默认20次重试，可以省略这个参数。
    });
    container.registerObject('tableClient', client);
  }
}
