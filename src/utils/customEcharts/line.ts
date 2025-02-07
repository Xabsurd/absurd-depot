import * as echarts from 'echarts/core';
import type {
  ComposeOption,
  DataZoomComponentOption,
  DatasetComponentOption,
  GridComponentOption,
  LineSeriesOption,
  TitleComponentOption
} from 'echarts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components';
import type { TitleOption, TooltipOption } from 'echarts/types/dist/shared.js';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

export type ECOption = ComposeOption<
  | LineSeriesOption
  | TooltipOption
  | TitleComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | DataZoomComponentOption
>;
echarts.use([
  LineChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  ToolboxComponent
]);

export default echarts;
