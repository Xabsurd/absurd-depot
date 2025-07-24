import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import copyPlugin from 'rollup-plugin-copy';
// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/absurd-depot/' : '/',
  plugins: [
    vue(),
    UnoCSS(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue']
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dirs: ['./src/components']
    }),
    copyPlugin({
      verbose: true,
      hook: 'closeBundle',
      copyOnce: true,
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/*',
          dest: 'dist/node_modules/cesium/Build/Cesium'
        },
        {
          src: 'node_modules/@iconify-icons/*',
          dest: 'dist/node_modules/@iconify-icons'
        },
        {
          src: 'node_modules/tinymce/*',
          dest: 'dist/node_modules/tinymce'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8794,
    proxy: {
      '/finance.sina/': {
        target: 'https://cn.finance.sina.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/finance.sina/, '')
      },
      '/fund.eastmoney/': {
        target: 'https://fund.eastmoney.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fund.eastmoney/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/styles/element/index.scss" as *;'
      }
    }
  }
});
