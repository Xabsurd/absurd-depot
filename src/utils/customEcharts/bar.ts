import type {
  BarSeriesOption,
  ComposeOption,
  DataZoomComponentOption,
  DatasetComponentOption,
  GridComponentOption,
  TitleComponentOption,
  TooltipComponentOption
} from 'echarts';
import { BarChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { TooltipOption } from 'echarts/types/dist/shared.js';
//按需引入的Echarts组件
export type ECOption = ComposeOption<
  | BarSeriesOption
  | TitleComponentOption
  | TooltipOption
  | GridComponentOption
  | DatasetComponentOption
  | DataZoomComponentOption
>;
echarts.use([
  BarChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  DataZoomComponent
]);
export default echarts;
