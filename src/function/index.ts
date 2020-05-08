import { Func, Inject, Provide } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import { readFileSync } from 'fs';
import { join } from 'path';

@Provide()
export class IndexFaaSService {

  @Inject()
  ctx: FaaSContext;  // context

  @Inject()
  baseDir;

  @Func('index.handler')
  async index() {
    this.ctx.type = 'html';
    this.ctx.body = readFileSync(join(this.baseDir, '../public/index.html'), 'utf8');
  }

}
