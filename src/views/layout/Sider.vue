<template>
  <ElMenu :default-active="$route.path" router :collapse="menuCollapse" class="Sider absurd-menu">
    <CreateMenu v-bind:menuMap="menuMap"></CreateMenu>
  </ElMenu>
</template>

<script lang="ts" setup>
import CreateMenu from './components/CreateMenu.vue';
// import menuMap from '../../router/menuMap';
import type { MenuMap } from '@/router';
import { useSettingStore } from '@/stores/setting';
import { computed } from 'vue';
import { getUserMenuMap } from '@/api/user';

const settingStore = useSettingStore();
const menuCollapse = computed(() => settingStore.menuCollapse);
const menuMap = ref<MenuMap[]>([]);
getUserMenuMap().then((res) => {
  menuMap.value = res;
});
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
