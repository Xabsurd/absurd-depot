<template>
  <div class="simple-line">
    <div class="tip">
      当前数字：
      <el-input-number v-model="state.num"></el-input-number>
      最大次数:{{ state.maxLen - 1 }}; 最大值:{{ state.maxNum }}; 动画时间:
      <el-input-number v-model="state.animationDuration"></el-input-number>
      是否显示文字:
      <el-switch v-model="state.showLabel" />
      绘制数量:
      <div class="w">
        <el-slider :min="1" :max="50" v-model="state.maxLine"></el-slider>
      </div>
    </div>
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import chartThemes from '../chartThemes'
import { onMounted, ref, reactive, computed, onUnmounted } from 'vue'
import echarts, { type ECOption } from '@/utils/customEcharts/line'
import type { DataZoomComponentOption } from 'echarts'
import { useSettingStore } from '@/stores/setting'
const settingStore = useSettingStore()
let lineChart: echarts.ECharts
const chart = ref<HTMLElement>()
const chartTheme = computed(() => {
  return chartThemes[settingStore.appliedTheme]
})
const state = reactive({
  num: 1,
  maxLen: 0,
  maxNum: 0,
  chartArr: [],
  colors: ['#1890ff'],

  // colors: ["#1890ff","#13c2c2","#52c41a","#a0d911","#ffec3d","#faad14","#fa8c16",'#fa541c',"#f5222d"],
  maxLine: 1,
  animationDuration: 1000,
  showLabel: true,
})
let resizeObserver: ResizeObserver
let timer: number
onMounted(() => {
  if (!chart.value) {
    return
  }
  const dataZoom: DataZoomComponentOption[] = [
    {
      type: 'inside',
      filterMode: 'none',
      yAxisIndex: [0],
    },
    {
      type: 'inside',
      filterMode: 'none',
      xAxisIndex: [0],
      // startValue: -20,
      // endValue: 20,
    },
    {
      filterMode: 'none',
      xAxisIndex: [0],
      // startValue: -20,
      // endValue: 20,
    },
    {
      filterMode: 'none',
      yAxisIndex: [0],
    },
  ]
  lineChart = echarts.init(chart.value, settingStore.theme)
  const option: ECOption = {
    textStyle: chartTheme.value.textStyle,
    backgroundColor: 'transparent',
    color: state.colors,
    xAxis: {
      type: 'category',
      data: [0],
    },
    animationDuration: 100000,
    grid: {
      top: 30,
      left: 60,
      right: 40,
      bottom: 50,
    },
    // tooltip: chartTheme.value.tooltip,
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: chartTheme.value.splitLine.lineStyle,
        show: true,
      },
    },
    dataZoom: dataZoom,
    series: [
      {
        data: [1],
        type: 'line',
      },
    ],
  }
  // const tooltip = option.tooltip;
  // if (tooltip) {
  //   (tooltip as TooltipOption).formatter = function (params: CallbackDataParams) {
  //     console.log(params);
  //     if (Array.isArray(params)) {
  //       return (
  //         `${params[0].seriesName}的第${params[0].dataIndex}次计算的值是:${params[0].value}` ||
  //         undefined
  //       );
  //     } else {
  //       return (
  //         `${params.seriesName}的第${params.dataIndex}次计算的值是:${params.value}` || undefined
  //       );
  //     }
  //   } as TooltipFormatterCallback<TopLevelFormatterParams>;
  //   // tooltip.trigger = undefined;
  //   // tooltip.axisPointer = undefined;
  // }
  lineChart.setOption(option)
  resizeObserver = new ResizeObserver((entries) => {
    lineChart.resize()
  })
  resizeObserver.observe(chart.value)
  resetTimer()
})
onUnmounted(() => {
  clearInterval(timer)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
function resetTimer() {
  clearInterval(timer)
  timer = window.setInterval(() => {
    addNum()
  }, state.animationDuration + 500)
}
function addNum() {
  state.num++
  const data = getData(state.num)
  const option = lineChart.getOption() as ECOption
  option.animationDuration = state.animationDuration
  if ((data.length > state.maxLen || state.maxLine === 1) && Array.isArray(option.xAxis)) {
    ;(option.xAxis[0] as any).data = createXAxis(data.length)
    state.maxLen = data.length
  }
  if (Array.isArray(option.series)) {
    if (option.series.length >= state.maxLine) {
      option.series = []
      lineChart.clear()
    }
    option.series.push({
      data: data,
      type: 'line',
      color: state.colors[state.num % state.colors.length],
      name: state.num,
      itemStyle: { normal: { label: { show: state.showLabel } } } as any,
    })
  }
  try {
    lineChart.setOption(option)
  } catch (error) {
    // console.log(error);
  }
}
function getData(num: number) {
  let x = num
  const data = [num]
  while (x > 1) {
    if (x % 2 === 0) {
      x = x / 2
    } else {
      x = x * 3 + 1
    }
    if (x > state.maxNum) {
      state.maxNum = x
    }
    data.push(x)
  }
  return data
}
function createXAxis(len: number) {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}
</script>

<style lang="scss" scoped>
.simple-line {
  height: 100%;
  display: flex;
  flex-direction: column;
  .chart {
    flex: 1;
  }
  .tip {
    display: flex;
    align-items: center;
    > div {
      margin: 0 10px 0 0;
      &.w {
        min-width: 200px;
        padding: 0 0 0 12px;
      }
    }
  }
}
</style>
