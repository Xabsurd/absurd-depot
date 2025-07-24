import request from '../request';

export function getFundInfo(params: string | number) {
  // console.log(`http://fund.eastmoney.com/pingzhongdata/${params}.js`);
  return request<string>({
    url: `./fund.eastmoney/pingzhongdata/${params}.js`,
    method: 'get'
  });
}
export function getFundjzgs(code: string | number) {
  return request<{ result: IMinlineData }>({
    url: `/finance.sina/minline/getMinlineData?symbol=sz${code}`,
    method: 'get'
  });
}
export function getTestFundInfo(params: string) {
  return request({
    url: `/data/${params}.js`,
    method: 'get'
  });
}
export interface IMinlineData {
  status: SinaStatus;
  data: SinaDatum[];
}

export interface SinaDatum {
  m: string;
  v: string;
  p: string;
  avg_p: string;
}

export interface SinaStatus {
  code: number;
  msg: string;
}
