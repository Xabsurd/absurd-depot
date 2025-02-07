import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/styles/element/index.scss" as *;'
      }
    }
  }
});
