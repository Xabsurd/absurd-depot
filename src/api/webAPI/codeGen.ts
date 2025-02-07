import type { IDataStructureOperate } from '@/types/apiEngine/codeGen';
import request from '../request';
/**
 * 调用webapi
//  */
class dataStructureOperate implements IDataStructureOperate {
  getAll(): Promise<DataStructureType[]> {
    throw new Error('Method not implemented.');
  }
  add(data: DataStructureType): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(data: DataStructureType): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  haveName(id: number, name: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
export const codeGen = {
  dataStructure: new dataStructureOperate()
};
