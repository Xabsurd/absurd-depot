import { db } from './CustomDB';
import type { ICodeGen } from '@/types/apiEngine/codeGen';
class dataStructureOperate {
  constructor() {}
  async getAll() {
    return db.dataStructures.toArray();
  }
  async add(data: DataStructureType) {
    return db.dataStructures.add(data);
  }
  async update(data: DataStructureType) {
    console.log(data.id);
    return await db.dataStructures.update(data.id, data);
  }
  async delete(id: number) {
    return await db.dataStructures.delete(id);
  }
  async haveName(id: number, name: string) {
    //判断ID不等于ID但name=name的数据是否存在
    const result = await db.dataStructures
      .where('id')
      .notEqual(id)
      .and((data) => data.name === name)
      .toArray();
    return result.length > 0;
  }
}
const codeGen: ICodeGen = {
  dataStructure: new dataStructureOperate()
};
export default codeGen;
