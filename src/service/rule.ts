import { Inject, Provide } from '@midwayjs/decorator';
import * as TableStore from 'tablestore';
import { DBClient } from '../dbClient';
import { v4 } from 'uuid';

const defaultRule = {
  href: 'https://ant.design',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
  owner: '秦粤',
  callNo: Math.floor(Math.random() * 1000),
  status: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
  progress: 0,
};

const tableName = 'todos';
const primaryKey = [{ 'key': 'list' } ];

@Provide()
export class RuleService {

  @Inject()
  DBClient: DBClient;

  async updateRule(data) {
    const updateData = this.updateTodos(data);
    return this.DBClient.updateRow(updateData);
  }

  async getRule(current: number, pageSize: number) {
    const TodoList = await this.getTodos();
    const result = {
      data: TodoList,
      total: TodoList.length,
      success: true,
      pageSize,
      current: current || 1,
    };
    return result;
  }

  async postRule(name: string, desc: string) {

    const TodoList = await this.getTodos();
    let newRule = { ...defaultRule, key: v4(), name, desc };
    TodoList.unshift(newRule);

    await this.updateRule(TodoList);

    return newRule;
  }

  async delRule(key) {
    let TodoList = await this.getTodos();
    TodoList = TodoList.filter(item => key.indexOf(item.key) === -1);

    await this.updateRule(TodoList);

    return {
      list: TodoList,
      pagination: {
        total: TodoList.length,
      },
    };
  }

  async putRule(name, desc, key, status) {
    
    const TodoList = await this.getTodos();
    const target = TodoList.findIndex((todo) => todo.key == key);
    let newRule = { ...TodoList[target], desc, name, status};
    TodoList[target] = newRule;

    await this.updateRule(TodoList);

    return newRule;
  }

  private updateTodos(data) {
    return {
      tableName,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
      primaryKey,
      updateOfAttributeColumns: [
        { 'PUT': [{ 'data': JSON.stringify(data) }] },
      ]
    };
  }

  private async getTodos() {
    const params = {
      tableName,
      primaryKey,
      returnContent: { returnType: TableStore.ReturnType.Primarykey }
    };

    const data: any = await this.DBClient.getRow(params);
    return JSON.parse(data.row.attributes[0].columnValue);
  }
}