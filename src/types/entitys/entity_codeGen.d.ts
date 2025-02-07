declare type FieldType = {
  name: string;
  type: SupportDataType;
  size: number;
  description: string;
  canNull: boolean;
};
declare type DataStructureType = {
  id?: number;
  name: string;
  alias: string;
  description: string;
  addTime: Date;
  dataStructure: FieldType[];
};
