<template>
  <div class="EstimationValueChart" ref="EstimationValueChartRef">{{ props.data }}</div>
</template>
<script setup lang="ts">
import { getFundjzgs, type SinaDatum } from '@/api/finance/fund';
import { onMounted, ref } from 'vue';
import echart from '@/utils/customEcharts/line';
import { getJZGSOption } from './fundOption';
const props = defineProps<{data:SinaDatum[]}>();
const EstimationValueChartRef = ref();
let chart = null;
onMounted(() => {
    chart = echart.init(EstimationValueChartRef.value);
    const option = getJZGSOption(props.data);
    chart.setOption(option);
});
</script>
<style lang="css" scoped>
.EstimationValueChart {
    width: 500px;
    height: 300px;
}
</style>
