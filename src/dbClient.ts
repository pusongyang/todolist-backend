import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Scope(ScopeEnum.Singleton)
@Provide('DBClient')
export class DBClient {

  @Inject()
  tableClient;

  async updateRow(data) {
    return new Promise((resolve, reject) => {
      this.tableClient.updateRow(data, function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    })
  }

  async getRow(data) {
    return new Promise((resolve, reject) => {
      this.tableClient.getRow(data, function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    })
  }

}