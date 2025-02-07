import type { IMinlineData, SinaDatum } from '@/api/finance/fund';
import type { ECOption } from '@/utils/customEcharts/line';
import { dateFormat } from '@/utils/dataTools';
import type { LineSeriesOption, TitleComponentOption } from 'echarts';
import type { TooltipOption, TopLevelFormatterParams } from 'echarts/types/dist/shared';
import type { CategoryAxisBaseOption } from 'echarts/types/src/coord/axisCommonTypes.js';
export function getLineOption(): ECOption {
  return {
    color: ['#409EFF', '#67C23A', '#F56C6C', '#E6A23C'],
    title: {
      text: 'line',
      left: 15
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      data: [],
      axisLabel: {}
    },
    yAxis: { axisLabel: {} },
    series: [getLineSeriesOption()]
  };
}
export function getLineSeriesOption(): LineSeriesOption {
  return {
    type: 'line',
    data: undefined,
    symbol: 'none',
    endLabel: {
      verticalAlign: 'bottom',
      align: 'center',
      show: true,
      color: '#409EFF'
    }
  };
}
/**
 * 根据指定索引从数组中提取值。
 *
 * @param {string | any[]} array - 输入数组，包含对象或值。
 * @param {string | number} index - 从数组元素中提取值的索引或键。
 * @return {any[]} 提取的值数组。
 */
function ArrayDowngrade(array: string | any[], index: string | number) {
  const data = [];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    data.push(element[index]);
  }
  return data;
}
export function getSPOption(base: string | any[], option: { perc: boolean } = { perc: true }) {
  const chartOption = getLineOption();
  (chartOption.title as TitleComponentOption).text = '股票仓位测算图';
  (chartOption.xAxis as CategoryAxisBaseOption).data = ArrayDowngrade(base, 0);
  (chartOption.series as LineSeriesOption[])[0].data = ArrayDowngrade(base, 1);
  (chartOption.xAxis as CategoryAxisBaseOption).axisLabel!.formatter = function (value) {
    return dateFormat('YYYY-mm-dd', new Date(Number(value)));
  };
  (chartOption.series as LineSeriesOption[])[0].endLabel!.formatter = (item) => {
    return item.data + (option.perc ? '' : '%');
  };
  (chartOption.yAxis as CategoryAxisBaseOption).axisLabel!.formatter = function (
    value: string | number
  ) {
    return value + (option.perc ? '' : '%');
  };
  (chartOption.tooltip as TooltipOption).formatter = (params: TopLevelFormatterParams) => {
    if (Array.isArray(params)) {
      return `${params
        .map((item) => {
          return (
            item.marker +
            dateFormat('YYYY-mm-dd', new Date(Number(item.name))) +
            ' : <strong>' +
            item.value +
            '' +
            (option.perc ? '' : '%') +
            '</strong>'
          );
        })
        .join('<br/>')}`;
    } else {
      return `${params.marker + dateFormat('YYYY-mm-dd', new Date(Number(params.name))) + ' : <strong>' + params.value + '' + (option.perc ? '' : '%') + '</strong>'}`;
    }
  };
  return chartOption;
}
export function getACWTOption(base: string | any[]) {
  const chartOption = getSPOption(base, { perc: true });
  (chartOption.title as TitleComponentOption).text = '累计净值走势';
  chartOption.dataZoom = [
    { type: 'inside', start: ((base.length - 50) / base.length) * 100, end: 100 },
    {}
  ];

  return chartOption;
}
export function getDGTOption(base: string | any[]) {
  const chartOption = getSPOption(base[0]['data'], { perc: false });
  (chartOption.title as TitleComponentOption).text = '累计收益率走势';
  chartOption.series = [];
  for (let i = 0; i < base.length; i++) {
    chartOption.series.push(getLineSeriesOption());
    chartOption.series[i].name = i === 0 ? '本基金' : base[i].name;
    chartOption.series[i].data = ArrayDowngrade(base[i]['data'], 1);
    chartOption.series[i].endLabel!.formatter = (param) => {
      return param.data + '%';
    };
    chartOption.series[i].endLabel!.color = (chartOption.color as string[])[i];
  }
  (chartOption.tooltip as TooltipOption)!.formatter = (params) => {
    // console.log(params);
    if (Array.isArray(params)) {
      return (
        dateFormat('YYYY-mm-dd', new Date(Number(params[0].name))) +
        '<br/>' +
        `${params
          .map((item) => {
            return item.marker! + item.seriesName! + ' : <strong>' + item.value + '%</strong>';
          })
          .join('<br/>')}`
      );
    } else {
      return (
        dateFormat('YYYY-mm-dd', new Date(Number(params.name))) +
        '<br/>' +
        `${params.marker! + params.seriesName! + ' : <strong>' + params.value + '%</strong>'}`
      );
    }
  };
  return chartOption;
}

export function getJZGSOption(base: SinaDatum[]) {
  const chartOption = getSPOption([[0, 0]], { perc: false });
  (chartOption.title as TitleComponentOption).text =
    '净值估算 ' + dateFormat('YYYY-mm-dd', new Date());
  (chartOption.xAxis as CategoryAxisBaseOption).data = ArrayDowngrade(base, 'm');
  console.log((chartOption.xAxis as CategoryAxisBaseOption).data);
  (chartOption.xAxis as CategoryAxisBaseOption).axisLabel!.formatter = function (
    value: any,
    index: any
  ) {
    // console.log(value);
    return value;
  };
  (chartOption.series as LineSeriesOption[])[0].data = base.map((element) => {
    if (element.p >= base[0].p) {
      chartOption.color = ['#F56C6C'];
    } else {
      chartOption.color = ['#67C23A'];
    }
    return { value: element.p, nav: element['v'] };
  });
  (chartOption.series as LineSeriesOption[])[0].endLabel!.color = (
    chartOption.color as string[]
  )[0];
  (chartOption.series as LineSeriesOption[])[0].endLabel!.formatter = (param) => {
    // console.log(param);
    return (param.data?.value as string) + '%';
    // return a.percentage + (option.perc ? "" : "%");
  };
  (chartOption.tooltip as TooltipOption)!.formatter = (params) => {
    console.log(params);
    if (Array.isArray(params)) {
      return `${params
        .map((item) => {
          return (
            item.marker +
            dateFormat('HH:MM:SS', new Date(Number(item.name))) +
            '<br/>估算净值: <strong>' +
            item.data?.nav +
            '</strong>' +
            '<br/>估算涨幅 : <strong>' +
            item.value +
            '%<strong/>'
          );
        })
        .join('<br/>')}`;
    } else {
      return `${
        params.marker +
        dateFormat('HH:MM:SS', new Date(Number(params.name))) +
        '<br/>估算净值: <strong>' +
        params.data?.nav +
        '</strong>' +
        '<br/>估算涨幅 : <strong>' +
        params.value +
        '%<strong/>'
      }`;
    }
  };
  return chartOption;
}

export interface FundBaseData {
  ishb: boolean;
  fS_name: string;
  fS_code: string;
  fund_sourceRate: string;
  fund_Rate: string;
  fund_minsg: string;
  stockCodes: string[];
  zqCodes: string;
  stockCodesNew: string[];
  zqCodesNew: string;
  syl_1n: string;
  syl_6y: string;
  syl_3y: string;
  syl_1y: string;
  Data_fundSharesPositions: Array<number[]>;
  Data_netWorthTrend: DataNetWorthTrend[];
  Data_ACWorthTrend: Array<number[]>;
  Data_grandTotal: DataGrandTotal[];
  Data_rateInSimilarType: DataRateInSimilarType[];
  Data_rateInSimilarPersent: Array<number[]>;
  Data_fluctuationScale: DataFluctuationScale;
  Data_holderStructure: Data;
  Data_assetAllocation: DataAssetAllocation;
  Data_performanceEvaluation: DataPerformanceEvaluation;
  Data_currentFundManager: DataCurrentFundManager[];
  Data_buySedemption: Data;
  swithSameType: Array<string[]>;
  jzgs: SinaDatum[];
}

export interface DataAssetAllocation {
  series: DataAssetAllocationSeries[];
  categories: Date[];
}

export interface DataAssetAllocationSeries {
  name: string;
  type: null | string;
  data: number[];
  yAxis: number;
}

export interface Data {
  series: DataBuySedemptionSeries[];
  categories: Date[];
}

export interface DataBuySedemptionSeries {
  name: string;
  data: number[];
}

export interface DataCurrentFundManager {
  id: string;
  pic: string;
  name: string;
  star: number;
  workTime: string;
  fundSize: string;
  power: DataPerformanceEvaluation;
  profit: Profit;
}

export interface DataPerformanceEvaluation {
  avr: string;
  categories: string[];
  dsc: string[];
  data: number[];
  jzrq?: Date;
}

export interface Profit {
  categories: string[];
  series: ProfitSeries[];
  jzrq: Date;
}

export interface ProfitSeries {
  data: Datum[];
}

export interface Datum {
  name: null;
  color: string;
  y: number;
}

export interface DataFluctuationScale {
  categories: Date[];
  series: DataFluctuationScaleSeries[];
}

export interface DataFluctuationScaleSeries {
  y: number;
  mom: string;
}

export interface DataGrandTotal {
  name: string;
  data: Array<number[]>;
}

export interface DataNetWorthTrend {
  x: number;
  y: number;
  equityReturn: number;
  unitMoney: string;
}

export interface DataRateInSimilarType {
  x: number;
  y: number;
  sc: string;
}
