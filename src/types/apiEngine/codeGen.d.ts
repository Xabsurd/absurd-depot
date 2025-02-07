export declare interface ICodeGen {
  dataStructure: IDataStructureOperate;
}
export declare interface IDataStructureOperate {
  getAll(): Promise<DataStructureType[]>;
  add(data: DataStructureType): Promise<number>;
  update(data: DataStructureType): Promise<number>;
  delete(id: number): Promise<void>;
  haveName(id: number, name: string): Promise<boolean>;
}
