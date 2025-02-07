import type { ICodeGen } from '@/types/apiEngine/codeGen';
import type { EngineType, IAPIObject } from '../types/apiEngine/apiEngine.d';
import IndexedDB from './indexedDB';
import WebAPI from './webAPI';
function apiEngine(type: EngineType = 'IndexedDB') {
  switch (type) {
    case 'IndexedDB':
      return IndexedDB;
    case 'WebAPI':
      return WebAPI;
  }
}
export default apiEngine();
