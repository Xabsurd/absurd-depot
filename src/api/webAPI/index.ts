import type { IAPIObject } from '@/types/apiEngine/apiEngine';
import { codeGen } from './codeGen';
//实现IAPIObject
const apiObject: IAPIObject = {
  codeGen: codeGen
};
export default apiObject;
