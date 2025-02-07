<script setup lang="ts">
import { getDashboardData } from '@/api/staticData';
import type { Dashboard } from '@/types/staticData';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import DynamicButtons from '@/components/button/DynamicButtons.vue';
import lineCharts, { type ECOption as LineOption } from '@/utils/customEcharts/line';
import barCharts, { type ECOption as BarOption } from '@/utils/customEcharts/bar';
import { useSettingStore } from '@/stores/setting';
import chartThemes from '../charts/chartThemes';
import type { BarSeriesOption } from 'echarts';
import { useI18n } from 'vue-i18n';
import type { MessageSchema } from '@/types/schema';
const { t } = useI18n<{ message: MessageSchema }>();
const totalChartRef = ref();
const languageChartRef = ref();
const settingStore = useSettingStore();
const state = reactive<{
  dashboard: Dashboard | null;
}>({
  dashboard: null
});
const chartTheme = computed(() => {
  return chartThemes[settingStore.appliedTheme];
});
const resizeObserver = new ResizeObserver((entries) => {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].target.className === totalChartRef.value.className) {
      totalChart?.resize();
    }
    if (entries[i].target.className === languageChartRef.value.className) {
      languageChart?.resize();
    }
  }
});
onMounted(() => {
  resizeObserver.observe(totalChartRef.value);
  resizeObserver.observe(languageChartRef.value);
  getDashboardData().then((res) => {
    initChart(res.data);
  });
});
onUnmounted(() => {
  // resizeObserver.unobserve(totalChartRef.value);
  totalChart?.dispose();
  resizeObserver.disconnect();
});
let totalChart: lineCharts.ECharts;
let languageChart: barCharts.ECharts;
function initChart(data: Dashboard) {
  state.dashboard = data;
  totalChart = lineCharts.init(totalChartRef.value, settingStore.appliedTheme);
  languageChart = barCharts.init(languageChartRef.value, settingStore.appliedTheme);
  const historyAxis = data.history.map((item) => item.date || '');
  const historyTotalData = data.history.map((item) => item.total);
  const historyCodeData = data.history.map((item) => item.code);
  const historyCommitData = data.history.map((item) => item.comment);
  const historyFileData = data.history.map((item) => item.files);
  const option: LineOption = {
    backgroundColor: 'transparent',
    tooltip: chartTheme.value.tooltip,
    grid: {
      top: 15,
      left: 0,
      right: 0,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: historyAxis,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'log',
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      },
      logBase: 10
    },

    series: [
      {
        name: 'files',
        data: historyFileData,
        stack: 'total',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          textBorderColor: 'transparent'
        }
      },
      {
        name: 'comment',
        data: historyCommitData,
        stack: 'total',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          textBorderColor: 'transparent'
        }
      },
      {
        name: 'code',
        data: historyCodeData,
        stack: 'total',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          textBorderColor: 'transparent'
        }
      },
      {
        name: 'lines',
        data: historyTotalData,
        stack: 'total',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          textBorderColor: 'transparent'
        }
      }
    ]
  };
  totalChart.setOption(option);
  const barSeries: BarSeriesOption[] = [];
  barSeries.push({
    name: 'lines',
    type: 'bar',
    data: data.languages.map((item) => item.total)
  });
  barSeries.push({
    name: 'code',
    type: 'bar',
    data: data.languages.map((item) => item.code)
  });
  barSeries.push({
    name: 'comment',
    type: 'bar',
    data: data.languages.map((item) => item.comment)
  });

  barSeries.push({
    name: 'files',
    type: 'bar',
    data: data.languages.map((item) => item.files)
  });

  const barOption: BarOption = {
    tooltip: chartTheme.value.tooltip,
    backgroundColor: 'transparent',
    grid: {
      top: 15,
      left: 0,
      right: 0,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: data.languages.map((item) => item.name || ''),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'log',
      logBase: 1000,
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: barSeries
  };
  languageChart.setOption(barOption);
}
</script>
<template>
  <div id="Home">
    <!-- <div>{{ state.dashboard }}</div> -->
    <div class="dashboard">
      <el-row :gutter="24">
        <el-col :span="6" :lg="6" :sm="12" :xs="24">
          <DynamicButtons class="total-cell large">
            <div class="total-cell-content">
              <DynamicIcon :icon="'mingcute:text-2-fill'"></DynamicIcon>
              <div>
                <p>lines</p>
                <p>{{ state.dashboard?.total.total }}</p>
              </div>
            </div>
          </DynamicButtons>
        </el-col>
        <el-col :span="6" :lg="6" :sm="12" :xs="24">
          <DynamicButtons class="total-cell large danger">
            <div class="total-cell-content">
              <DynamicIcon :icon="'mingcute:code-fill'"></DynamicIcon>
              <div>
                <p>code</p>
                <p>{{ state.dashboard?.total.code }}</p>
              </div>
            </div>
          </DynamicButtons>
        </el-col>
        <el-col :span="6" :lg="6" :sm="12" :xs="24">
          <DynamicButtons class="total-cell large success">
            <div class="total-cell-content">
              <DynamicIcon :icon="'mingcute:command-fill'"></DynamicIcon>
              <div>
                <p>comment</p>
                <p>{{ state.dashboard?.total.comment }}</p>
              </div>
            </div>
          </DynamicButtons>
        </el-col>
        <el-col :span="6" :lg="6" :sm="12" :xs="24">
          <DynamicButtons class="total-cell large warning">
            <div class="total-cell-content">
              <DynamicIcon :icon="'mingcute:file-code-line'"></DynamicIcon>
              <div>
                <p>files</p>
                <p>{{ state.dashboard?.total.files }}</p>
              </div>
            </div>
          </DynamicButtons>
        </el-col>
      </el-row>
      <el-row>
        <div class="total-title">{{ t('page.home.line-title') }}</div>
        <div class="total-chart" ref="totalChartRef"></div>
      </el-row>
      <el-row>
        <div class="language-title">{{ t('page.home.bar-title') }}</div>
        <div class="language-chart" ref="languageChartRef"></div>
      </el-row>
    </div>
  </div>
</template>
<style scoped lang="scss">
#Home {
  width: 100%;
  height: 100%;
  overflow: auto;
  .dashboard {
    padding: 0 2rem;
    box-sizing: border-box;
    .total-cell {
      width: 100%;
      margin-top: 2rem;
      --bg-color: none;
      color: #ddd;
      .total-cell-content {
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 4.5rem;
          margin-right: 1rem;
          width: 4.5rem;
          height: 4.5rem;
        }
        > div {
          display: flex;
          flex-direction: column;
          p:nth-child(1) {
            font-size: 1.5rem;
            font-weight: 600;
            opacity: 0.6;
          }
          p:nth-child(2) {
            font-size: 3rem;
            font-weight: 600;
            // line-height: 4rem;
          }
        }
      }
    }
    .grid-content {
      border-radius: 4px;
      min-height: 36px;
      border: 1px solid var(--el-border-color);
    }

    .total-title,
    .language-title {
      width: 100%;
      border-radius: var(--el-border-radius-base) var(--el-border-radius-base) 0 0;
      margin-top: 2rem;
      font-size: 1.2rem;
      font-weight: 600;
      padding: 0.5rem;
      background-color: rgba(130, 130, 130, 0.1);
      opacity: 0.8;
    }
    .total-chart,
    .language-chart {
      width: 100%;
      height: 350px;
      border-radius: var(--el-border-radius-base);
    }
    .language-chart {
      margin-bottom: 1rem;
    }
  }
}
</style>
