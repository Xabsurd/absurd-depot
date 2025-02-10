import type { RouteRecordRaw } from 'vue-router';

export type MenuMap = {
  icon?: string;
} & RouteRecordRaw;
const menuMap: MenuMap[] = [
  {
    path: '/home',
    name: 'home',
    icon: 'icon-home',
    component: () => import('../views/home/Home.vue')
  },
  {
    path: '/setting',
    name: 'setting',
    icon: 'icon-setting',
    component: () => import('../views/setting/Setting.vue')
  },
  {
    path: '/codeGen',
    name: 'codeGen',
    icon: 'icon-setting',
    component: () => import('../views/codeGen/CodeGen.vue')
  },
  {
    path: '/testCode',
    name: 'testCode',
    icon: 'icon-setting',
    component: () => import('../views/codeGen/TestCode.vue')
  },
  {
    path: '/charts',
    icon: 'icon-barchart',
    name: 'charts',
    children: [
      {
        path: 'line',
        name: 'charts-line',
        children: [
          {
            path: 'simpleLine',
            name: 'charts-line-simpleLine',
            component: () => import('../views/charts/lines/SimpleLine.vue')
          },
          {
            path: 'function',
            name: 'charts-line-function',
            component: () => import('../views/charts/lines/FunctionLine.vue')
          },
          {
            path: '3n+1',
            name: 'charts-line-3n+1',
            component: () => import('../views/charts/lines/3N+1.vue')
          }
        ]
      },
      {
        path: 'tools',
        name: 'charts-tools',
        children: [
          {
            path: 'fund',
            name: 'charts-tools-fund',
            component: () => import('../views/charts/tools/Fund.vue')
          }
        ]
      }

      // {
      //   path: 'home-loans',
      //   component: () => import('../views/charts/lines/HomeLoans.vue'),
      // },
    ]
  },
  {
    path: '/game',
    name: 'game',
    icon: 'icon-game',
    children: [
      {
        path: 'minesweeper',
        name: 'game-minesweeper',
        children: [
          {
            path: 'normal',
            name: 'game-minesweeper-normal',
            component: () => import('../views/game/minesweeper/Normal.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/tools',
    name: 'tools',
    icon: 'icon-tools',
    children: [
      {
        path: 'image',
        name: 'tools-image',
        children: [
          {
            path: 'grayscaleImage',
            name: 'tools-image-grayscaleImage',
            component: () => import('../views/tools/image/GrayscaleImage.vue')
          },
          {
            path: 'watermarkEditor',
            name: 'tools-image-watermarkEditor',
            component: () => import('../views/tools/image/WatermarkEditor.vue')
          }
        ]
      },
      {
        path: 'draw',
        name: 'tools-draw',
        children: [
          {
            path: 'overPointCurve',
            name: 'tools-draw-overPointCurve',
            component: () => import('../views/tools/draw/OverPointCurve.vue')
          }
        ]
      },
      {
        path: 'word',
        name: 'tools-word',
        children: [
          {
            path: 'passwordGenerator',
            name: 'tools-word-passwordGenerator',
            component: () => import('../views/tools/word/PasswordGenerator.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/GIS',
    name: 'GIS',
    icon: 'icon-gis',
    children: [
      {
        path: 'cesium',
        name: 'cesium',
        component: () => import('../views/GIS/cesium/Cesium.vue'),
        meta: {
          animation: false
        },
        children: [
          {
            path: 'start',
            name: 'cesium-start',
            component: () => import('../views/GIS/cesium/start/Start.vue')
          },
          {
            path: 'measurement',
            name: 'cesium-measurement',
            component: () => import('../views/GIS/cesium/measurement/Measurement.vue')
          }
        ]
      },
      {
        path: 'openlayer',
        name: 'openlayer',
        component: () => import('../views/GIS/openlayer/Start.vue'),
        meta: {
          animation: false
        }
        // children: []
      }
    ]
  }
];
export default menuMap;
