export interface Dashboard {
  languages: Statisticians[];
  total: Statisticians;
  history: Statisticians[];
}

export interface Statisticians {
  date?: string;
  total: number;
  code: number;
  comment: number;
  blank: number;
  files: number;
  name?: string;
}
