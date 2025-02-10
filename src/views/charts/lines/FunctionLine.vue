<template>
  <div class="function-line">
    <!-- <div class="input-box">
      <div>
        <div>
          <p>f(x)=</p>
          <p>(js代码)</p>
        </div>
      </div>
      <el-input v-model="functionText" type="textarea" />
      <el-button @click="resetChart">运行</el-button>
      <el-input v-model="functionName" />
      <el-button @click="resetChart">添加</el-button>
    </div> -->
    <el-form class="input-setting" label-width="110px">
      <el-form-item :label="t('page.chart.line.functionLine.functionText')">
        <el-input v-model="state.functionText" type="textarea" />
      </el-form-item>
      <el-form-item :label="t('page.chart.line.functionLine.functionName')">
        <el-input v-model="state.functionName" />
      </el-form-item>
      <el-form-item :label="t('page.chart.line.functionLine.max')">
        <el-input-number v-model="state.max" />
      </el-form-item>
      <el-form-item :label="t('page.chart.line.functionLine.min')">
        <el-input-number v-model="state.min" />
      </el-form-item>
      <el-form-item :label="t('page.chart.line.functionLine.interval')">
        <el-input-number v-model="state.interval" :step="0.01" />
      </el-form-item>
      <el-form-item :label="t('page.chart.line.functionLine.smooth')">
        <el-switch v-model="state.smooth"></el-switch>
      </el-form-item>
      <el-form-item label="">
        <el-button @click="initChart">{{ t('page.chart.line.functionLine.run') }}</el-button>
        <el-button @click="addChart">{{ t('page.chart.line.functionLine.add') }}</el-button>
        <el-button @click="boom">boom</el-button>
      </el-form-item>
    </el-form>
    <div class="chart-box">
      <div class="chart-value" v-html="state.chartValue"></div>
      <div class="chart" ref="chartDom"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import chartThemes from '../chartThemes';
import echarts, { type ECOption } from '@/utils/customEcharts/line';
import { type LineSeriesOption } from 'echarts/charts';
import type { DataZoomComponentOption } from 'echarts/components';
import type { TooltipOption, TopLevelFormatterParams } from 'echarts/types/dist/shared.js';
import { useI18n } from 'vue-i18n';
import type { MessageSchema } from '@/types/schema';
import { useSettingStore } from '@/stores/setting';
const { t } = useI18n<{ message: MessageSchema }>();
const state = reactive({
  functionName: 'f(x)',
  functionText: 'return Math.sin(x) * Math.cos(x * 2 + 1) * Math.sin(x * 3 + 2) * 50;',
  windowResize: null,
  max: 20,
  min: -20,
  interval: 0.01,
  smooth: false,
  first: true,

  chartNum: 0,
  chartValue: ''
});
const settingStore = useSettingStore();
// const uiText = computed(() => {
//   return mainState.uiText.chart.line.functionLine;
// });
console.log(settingStore.theme);
const chartTheme = computed(() => {
  return chartThemes[settingStore.appliedTheme];
});

const chartDom = ref<HTMLElement>();
let lineChart: echarts.ECharts;
onMounted(() => {
  console.log(settingStore.theme);
  if (chartDom.value) {
    lineChart = echarts.init(chartDom.value, settingStore.theme);
    nextTick(() => {
      initChart();
    });
    // this.windowResize = window.addEventListener("resize", this.resize);
    const resizeObserver = new ResizeObserver((entries) => {
      resize();
    });
    resizeObserver.observe(chartDom.value);
  }
});
function boom() {
  state.functionText = 'return x';
  initChart();
  for (let i = 2; i < 100; i++) {
    setTimeout(() => {
      state.functionText = 'return x*' + i;
      addChart();
    }, i * 1000);
  }
}
function resetChart() {
  const option = lineChart.getOption() as ECOption;
  (option.series as LineSeriesOption[]).push({
    name: state.functionName,
    type: 'line',
    smooth: state.smooth ? 1 : 0,
    showSymbol: false,
    clip: true,
    data: setData()
  });
  lineChart.setOption(option);
}
function addChart() {
  state.chartNum++;
  const option = lineChart.getOption() as ECOption;
  (option.series as LineSeriesOption[]).push({
    name: '(' + state.functionName + ')' + state.chartNum,
    type: 'line',
    smooth: state.smooth ? 1 : 0,
    showSymbol: false,
    clip: true,
    data: setData()
  });
  lineChart.setOption(option);
}
function initChart() {
  let dataZoom: DataZoomComponentOption[] = [
    {
      type: 'inside',
      filterMode: 'none',
      yAxisIndex: [0]
    },
    {
      type: 'inside',
      filterMode: 'none',
      xAxisIndex: [0]
      // startValue: -20,
      // endValue: 20,
    },
    {
      filterMode: 'none',
      xAxisIndex: [0]
      // startValue: -20,
      // endValue: 20,
    },
    {
      filterMode: 'none',
      yAxisIndex: [0]
    }
  ];
  try {
    dataZoom = lineChart.getOption().dataZoom as DataZoomComponentOption[];
  } catch (error) {
    console.log(error);
  }
  state.chartNum++;
  const option: ECOption = {
    animation: false,
    // textStyle: chartTheme.value.textStyle,
    backgroundColor: 'transparent',
    grid: {
      top: 30,
      left: 60,
      right: 40,
      bottom: 50
    },
    tooltip: chartTheme.value.tooltip,
    xAxis: {
      name: 'x',
      minorTick: {
        show: true
      },
      axisLine: {
        show: true,
        lineStyle: chartTheme.value.axisLine.lineStyle
      },
      minorSplitLine: {
        show: true,
        lineStyle: chartTheme.value.minorSplitLine.lineStyle
      },
      splitLine: {
        lineStyle: chartTheme.value.splitLine.lineStyle,
        show: true
      },
      axisPointer: {
        value: (state.max + state.min) / 2,
        snap: true,
        lineStyle: {
          color: '#7581BD',
          width: 2
        },
        label: {
          show: true,
          backgroundColor: '#7581BD'
        },
        handle: {
          show: true,
          color: '#7581BD'
        }
      }
    },
    yAxis: {
      name: 'y',
      minorTick: {
        show: true
      },
      axisLine: {
        show: true,
        lineStyle: chartTheme.value.axisLine.lineStyle
      },
      minorSplitLine: {
        show: true,
        lineStyle: chartTheme.value.minorSplitLine.lineStyle
      },
      splitLine: {
        lineStyle: chartTheme.value.splitLine.lineStyle,
        show: true
      }
    },
    dataZoom: dataZoom,
    series: [
      {
        name: '(' + state.functionName + ')' + state.chartNum,
        type: 'line',
        smooth: state.smooth ? 1 : 0,
        showSymbol: false,
        clip: true,
        data: setData()
      }
    ]
  };
  (option.tooltip as TooltipOption).formatter = (params: TopLevelFormatterParams) => {
    let text = '';
    if (Array.isArray(params)) {
      for (let i = 0; i < params.length; i++) {
        const element = params[i];
        let name = element.seriesName;
        if (name) {
          name = name.substring(1, name.lastIndexOf(')'));
          const data = element.data as string[];
          text +=
            `${element.marker} ${name} : (x : ${(data as string[])[0]} , y : ${
              (data as string[])[1]
            })` + '<br/>';
        }
      }
    } else {
      const data = params.data as string[];
      text = `${params.marker} ${params.seriesName} : (x : ${data[0]} , y : ${data[1]})`;
    }
    state.chartValue = text;
    return text;
  };
  lineChart.setOption(option, true);
}
function setData() {
  const functionText = state.functionText;
  function func(x: number) {
    const runText = `((x)=>{${functionText}})(${x})`;
    return window.eval(runText);
  }
  const data = [];
  for (let i = state.min; i <= state.max; i += state.interval) {
    data.push([i.toFixed(4), func(i).toFixed(4)]);
  }
  return data;
}
function resize() {
  lineChart.resize();
}
</script>

<style lang="scss" scoped>
.function-line {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  // flex-direction: column;
  position: relative;
  :deep(textarea) {
    min-height: 100px !important;
  }
  .input-setting {
    overflow: auto;
    flex-shrink: 0;
    padding-top: 15px;
  }
  .chart-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 500px;
    .chart {
      flex: 1;
      overflow: hidden;
    }
    .chart-value {
      display: none;
    }
  }
}
@screen lt-lg {
  .function-line {
    .chart-box {
      min-width: 100%;
      .chart-value {
        display: block;
        width: 100%;
        background-color: var(--content-color);
        max-height: 200px;
        overflow: auto;
        text-align: center;
      }
    }
  }
}
</style>
