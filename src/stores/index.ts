// import { set } from 'ol/transform';
import { defineStore } from 'pinia';
export const useMainStore = defineStore('MainStore', {
  state() {
    return {
      pageLoading: true,
      routerLoading: false
    };
  },
  getters: {},
  actions: {
    setPageLoading(pageLoading: boolean) {
      this.pageLoading = pageLoading;
      document.getElementById('pageLoading')!.style.display = pageLoading ? 'flex' : 'none';
    }
  }
});
// const mainState = MainStore();
