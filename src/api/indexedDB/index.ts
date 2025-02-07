import type { IAPIObject } from '@/types/apiEngine/apiEngine';
import codeGen from './codeGen';
import Dexie from 'dexie';
const IndexedDBEngine: IAPIObject = {
  codeGen: codeGen
};
// export function initDB() {
//   const db = new IndexedDBHelper('absurd-admin', 1);
//   db.createStore('DataStructure', 'id,name,fieldList,addTime');
// }
//实现IAPIObject
export function initDB() {
  const db = new Dexie('absurd-admin');
  db.version(1).stores({
    DataStructure: 'id,name,fieldList,addTime,description'
  });
  return db;
}
export default IndexedDBEngine;
