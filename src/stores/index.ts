import { defineStore } from 'pinia';
export const useMainStore = defineStore('MainStore', {
  state() {
    return {
      pageLoading: true,
      routerLoading: false
    };
  },
  getters: {},
  actions: {}
});
// const mainState = MainStore();
