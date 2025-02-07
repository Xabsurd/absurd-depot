<template>
  <ElMenu :default-active="$route.path" router :collapse="menuCollapse" class="Sider absurd-menu">
    <CreateMenu v-bind:menuMap="menuMap"></CreateMenu>
  </ElMenu>
</template>

<script lang="ts" setup>
import CreateMenu from './components/CreateMenu.vue';
import menuMap from '../../router/menuMap';
import { useSettingStore } from '@/stores/setting';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();
console.log(route);
const settingStore = useSettingStore();
// mainState.changeLeaguage("asd");
const menuCollapse = computed(() => settingStore.menuCollapse);
</script>

<style lang="scss" scoped>
.Sider {
  width: 220px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border: none;
  background-color: var(--sider-bg-color);
  color: var(--sider-text-color);
  z-index: 1;
}
.el-menu--collapse {
  width: 0px;
}
</style>
