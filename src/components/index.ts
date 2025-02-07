import ToHeader from './layout/ToHeader.vue';
import { type App } from 'vue';
//在此处注册全局组件
export default {
  install: (app: App) => {
    app.component('to-header', ToHeader);
  }
};
