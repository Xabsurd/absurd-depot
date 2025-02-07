<template>
  <div id="fund">
    <div class="input-fund">
      基金代码：
      <el-input class="input-fund-input" v-model="state.inputFund"></el-input>
      <el-button class="input-fund-button" type="primary" @click="handleAdd(state.inputFund)">
        添加
      </el-button>
      <span>查询的基金代码会存储在localStorage中以便于刷新后查看</span>
      <!-- <el-button class="input-fund-button" type="primary" @click="refreshJZGS">刷新净值估算</el-button> -->
    </div>
    <div class="chart-title">
      <div class="chart-title-box" :style="{ left: -state.chartBoxScrollLeft + 'px' }">
        <div class="chart-title-item" v-for="(item, index) in FundData" :key="index">
          {{ index }}:{{ item.base.fS_name }}
          <div class="chart-close" @click="removeFund(index)">
            <i class="iconfont icon-guanbi"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="chart-box" @scroll="scrollChange">
      <div class="chart-item" v-for="(item, index) in FundData" :key="index">
        <div class="chart-item-box" v-if="item.base.jzgs">
          <div class="chart-item-subtitle">
            <span
              v-if="item.base.jzgs"
              :style="{
                color:
                  parseInt(item.base.jzgs[item.base.jzgs.length - 1].p) >= 0 ? '#F56C6C' : '#67C23A'
              }"
            >
              {{
                '估算涨幅 : ' +
                item.base.jzgs[item.base.jzgs.length - 1].v +
                '%   净值估算' +
                item.base.jzgs[item.base.jzgs.length - 1].p
              }}
            </span>
          </div>
          <EstimationValueChart :data="item.base.jzgs"></EstimationValueChart>
        </div>
        <div class="chart-item-box">
          <div class="chart-item-subtitle">
            <span v-for="(data, index) in item.base.Data_grandTotal" :key="index">
              {{
                (index === 0 ? '本基金' : data.name) +
                ' : ' +
                data.data[data.data.length - 1][1] +
                '%'
              }}
            </span>
          </div>
          <div class="chart-item-chart chart-item-dgt" :class="['chart-dgt-' + index]"></div>
        </div>

        <div class="chart-item-box">
          <div class="chart-item-subtitle" v-if="item.base.Data_ACWorthTrend">
            <span>
              {{
                '单位净值 : ' +
                item.base.Data_ACWorthTrend[item.base.Data_ACWorthTrend.length - 1][1]
              }}
            </span>
          </div>
          <div class="chart-item-chart chart-item-acwt" :class="['chart-acwt-' + index]"></div>
        </div>
        <div class="chart-item-box" v-if="item.base.Data_fundSharesPositions.length > 0">
          <div class="chart-item-subtitle">
            <span>
              {{
                '股票仓位 : ' +
                item.base.Data_fundSharesPositions[
                  item.base.Data_fundSharesPositions.length - 1
                ][1] +
                '%'
              }}
            </span>
          </div>
          <div class="chart-item-chart chart-item-sp" :class="['chart-sp-' + index]"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getFundInfo, getFundjzgs } from '@/api/finance/fund';
import { dateFormat, getEvalVariable } from '@/utils/dataTools';
// import { mapState } from 'vuex';
import {
  getSPOption,
  getACWTOption,
  getDGTOption,
  getJZGZOption,
  type FundBaseData
} from './fundOption';
import { computed, nextTick, reactive } from 'vue';
import { useSettingStore } from '@/stores/setting';
import chartThemes from '../chartThemes';
import echarts from '@/utils/customEcharts/line';
import type { TitleComponentOption } from 'echarts';
import EstimationValueChart from './EstimationValueChart.vue';
const FundData = reactive<{
  [key: string]: {
    base: FundBaseData;
    chart?: {
      acwt?: any;
      dgt?: any;
      jzgs?: any;
      sp?: any;
    };
  };
}>({});
const state = reactive({
  code: '161725',
  chart: undefined,
  inputFund: 161725,
  testData: undefined,
  chartBoxScrollLeft: 0
});
const settingStore = useSettingStore();
const chartTheme = computed(() => {
  return chartThemes[settingStore.appliedTheme];
});
function handleAdd(code: any) {
  let fundList = JSON.parse(localStorage.getItem('fundList')!);
  if (!fundList) {
    fundList = [];
  }
  if (fundList.indexOf(code) < 0) {
    fundList.push(code);
    localStorage.setItem('fundList', JSON.stringify(fundList));
  }
  addFund(code);
}
function addFund(code: string) {
  if (!FundData[code]) {
    getFundInfo(code).then((response) => {
      FundData[code] = { base: getEvalVariable(response.data) };
      console.log(FundData[code]);
      // changeData();
      nextTick(() => {
        FundData[code].chart = {
          acwt: echarts.init(
            document.getElementsByClassName('chart-acwt-' + code)[0] as HTMLElement
          ),
          dgt: echarts.init(document.getElementsByClassName('chart-dgt-' + code)[0] as HTMLElement)
        };

        if (FundData[code].base.Data_fundSharesPositions.length > 0) {
          FundData[code].chart.sp = echarts.init(
            document.getElementsByClassName('chart-sp-' + code)[0] as HTMLElement
          );
          const option = getSPOption(FundData[code].base.Data_fundSharesPositions);
          option.textStyle = chartTheme.value.textStyle;
          (option.title as TitleComponentOption).textStyle = chartTheme.value.textStyle;
          FundData[code].chart.sp.setOption(option);
        }

        const option1 = getACWTOption(FundData[code].base.Data_ACWorthTrend);
        option1.textStyle = chartTheme.value.textStyle;
        (option1.title as TitleComponentOption).textStyle = chartTheme.value.textStyle;
        const option2 = getDGTOption(FundData[code].base.Data_grandTotal);
        option2.textStyle = chartTheme.value.textStyle;
        (option2.title as TitleComponentOption).textStyle = chartTheme.value.textStyle;
        FundData[code].chart.acwt.setOption(option1);
        FundData[code].chart.dgt.setOption(option2);
        getFundjzgs(code).then((jzgs) => {
          console.log(jzgs.data.result.data);
          if (jzgs.data.result.data.length > 0) {
            console.log(jzgs);
            FundData[code].base.jzgs = jzgs.data.result.data;
            // this.changeData();
            nextTick(() => {
              FundData[code].chart!.jzgs = echarts.init(
                document.getElementsByClassName('chart-jzgs-' + code)[0] as HTMLElement
              );
              // const option3 = getJZGZOption(jzgs.data.result.data);
              // console.log(option3);
              // option3.textStyle = chartTheme.value.textStyle;
              // (option3.title as TitleComponentOption).textStyle = chartTheme.value.textStyle;
              // FundData[code].chart?.jzgs.setOption(option3);
            });
          }
        });
      });
    });
  }
}
function removeFund(code:string) {
  delete FundData[code];
  // this.changeData();
  const fundList = [];
  for (const key in FundData) {
    fundList.push(key);
  }
  localStorage.setItem('fundList', JSON.stringify(fundList));
}
</script>
<style scoped>
#fund {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  position: relative;
}

.input-fund {
  width: 100%;
  padding: 5px;
}
.input-fund-input {
  width: 100px;
}
/* .input-fund-button {
  width: 100px;
} */

.chart-title {
  height: 30px;
}
.chart-title-box {
  position: absolute;
  white-space: nowrap;
}
.chart-title-item {
  width: 500px;
  height: 30px;
  text-align: center;
  display: inline-block;
  font-size: 18px;
  color: #409eff;
}
.chart-close {
  display: inline-block;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  border-radius: 50%;
}
.chart-close:hover {
  background: #e2e2e2;
}
.chart-box {
  flex: 1;
  overflow: auto;
  white-space: nowrap;
}
.chart-item {
  width: 500px;
  /* height: 2000px; */
  display: inline-block;
}
.chart-item-chart {
  width: 100%;
  height: 400px;
}
.chart-item-box {
  position: relative;
}
.chart-item-subtitle {
  position: absolute;
  top: 30px;
  left: 10px;
  color: #409eff;
  z-index: 1;
}
.chart-item-subtitle span {
  padding: 0 10px;
}
.chart-item-subtitle span:nth-child(100n + 2) {
  color: #67c23a;
}
.chart-item-subtitle span:nth-child(100n + 3) {
  color: #f56c6c;
}
</style>
