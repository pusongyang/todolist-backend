import { Inject, Provide } from '@midwayjs/decorator';
import * as TableStore from 'tablestore';
import { DBClient } from '../dbClient';
import { findIndex, omit } from 'lodash';
import { v4 } from 'uuid';
import * as md5 from 'md5';

const MD5_String = "2340b7c9a63b3";

// 初始化当前用户
const meDefault = {
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
export class UserService {


  @Inject()
  DBClient: DBClient;


  async getUser(id) {
    const users = await this.getUsers();
    if (users[id]) {
      const { name } = users[id];
      return {...meDefault, name: name};
    } else {
      return meDefault;
    }
    
  }

  async getUsers() {
    const data: any = await this.getUsersFromDB();
    let users = JSON.parse(data.row.attributes[0].columnValue);
    return omit(users, ['password'])
  }

  async register(name: string, password: string) {
    const users: any = await this.getUsersFromDB();
    const existUser = findIndex(users, {name});
    if ( existUser === -1 ){
      users.push({
        key: v4(),
        name,
        password: md5(`PW_${password}_${MD5_String}`),
      });
    } else {
      return {
        success: false,
        msg: 'userName exist'
      };
    }

    const params = {
      tableName:"user",
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
      primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
      updateOfAttributeColumns: [
        { 'PUT': [{ 'data': JSON.stringify(users) }] },
      ]
    };

    await this.DBClient.updateRow(params);
    return {
      success: true,
      result: name
    }
  }

  async login(name: string, password: string) {
    const data: any = await this.getUsersFromDB();
    const findUser = {
      name,
      password: md5(`PW_${password}_${MD5_String}`),
    };
    try {
      const users = JSON.parse(data.row.attributes[0].columnValue);
      return findIndex(users,findUser);
    } catch (error) {
      console.error('error:', error);
    }
  }

  private async getUsersFromDB() {
    return this.DBClient.getRow({
      tableName:'user',
      primaryKey:[{ 'id': TableStore.Long.fromNumber(1) } ],
      returnContent: { returnType: TableStore.ReturnType.Primarykey }
    });
  }

}