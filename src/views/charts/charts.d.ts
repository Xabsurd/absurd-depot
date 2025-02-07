import type {  TooltipComponentOption } from 'echarts/components';

export interface ChartThemeType {
  textStyle: {
    color: string;
  };
  splitLine: {
    lineStyle: {
      color: string;
    };
  };
  axisLine: {
    lineStyle: {
      color: string;
    };
  };
  minorSplitLine: {
    lineStyle: {
      color: string;
    };
  };
  tooltip: TooltipComponentOption;
}
