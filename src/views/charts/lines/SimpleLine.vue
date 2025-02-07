<script setup lang="ts">
import { onMounted, ref } from 'vue';
import echarts, { type ECOption } from '@/utils/customEcharts/line';
import { useSettingStore } from '@/stores/setting';
const settingStore = useSettingStore();
const chartDom = ref();
const option: ECOption = {
  backgroundColor: 'transparent',
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true
    }
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ]
};
let charts: echarts.ECharts;
onMounted(() => {
  charts = echarts.init(chartDom.value, settingStore.theme);
  charts.setOption(option);
});
</script>
<template>
  <div class="simple-line">
    <div ref="chartDom"></div>
  </div>
</template>
<style scoped lang="scss">
.simple-line {
  width: 100%;
  height: 100%;
  > div {
    width: 100%;
    height: 100%;
  }
}
</style>
