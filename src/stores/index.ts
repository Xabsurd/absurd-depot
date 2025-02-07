import { defineStore } from 'pinia';
export const useMainStore = defineStore('MainStore', {
  state() {
    return {
      pageLoading: false,
      routerLoading: false
    };
  },
  getters: {},
  actions: {}
});
// const mainState = MainStore();
