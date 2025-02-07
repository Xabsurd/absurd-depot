import type { ChartThemeType } from './charts';
const chartTheme: { [key: string]: ChartThemeType } = {
  light: {
    textStyle: {
      color: '#000'
    },
    splitLine: {
      lineStyle: {
        color: '#0001'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#0001'
      }
    },
    minorSplitLine: {
      lineStyle: {
        color: '#0001'
      }
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#000',
          backgroundColor: '#fff'
        }
      }
    }
  },
  dark: {
    textStyle: {
      color: '#d4d4d4'
    },
    splitLine: {
      lineStyle: {
        color: '#fff2'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#fff2'
      }
    },
    minorSplitLine: {
      lineStyle: {
        color: '#fff2'
      }
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#d4d4d4',
          backgroundColor: 'rgb(30, 30, 30)'
        }
      },
      backgroundColor: 'rgb(30, 30, 30)',
      borderWidth: 0,
      textStyle: {
        color: '#d4d4d4'
      }
    }
  }
};
export default chartTheme;
