import { Provide, ScopeEnum, Scope, Config } from '@midwayjs/decorator';
import * as staticCache from 'koa-static-cache';

@Provide('staticFile')
@Scope(ScopeEnum.Singleton)
export class StaticFile {
  @Config('staticFile')
  staticConfig;

  resolve() {
    return staticCache(this.staticConfig);
  }
}
