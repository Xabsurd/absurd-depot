<template>
  <header id="header">
    <DynamicIcon
      :icon="
        settingStore.menuCollapse
          ? 'mingcute:indent-increase-fill'
          : 'mingcute:indent-decrease-fill'
      "
      @click="changeMenuCollapse"
    ></DynamicIcon>
    <DynamicIcon
      :icon="
        settingStore.fullScreen === 3 ? 'mingcute:fullscreen-exit-fill' : 'mingcute:fullscreen-fill'
      "
      class="full"
      @click="fullClick"
    ></DynamicIcon>

    <DynamicIcon
      :icon="
        settingStore.fullScreen === 1
          ? 'mingcute:fullscreen-exit-2-fill'
          : 'mingcute:fullscreen-2-fill'
      "
      class="full"
      @click="bodyFull"
    ></DynamicIcon>
  </header>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
// import { getCurrentInstance } from 'vue';
import { useSettingStore } from '@/stores/setting';
// const test = getCurrentInstance();
const settingStore = useSettingStore();
function changeMenuCollapse() {
  settingStore.menuCollapse = !settingStore.menuCollapse;
}
function fullClick() {
  if (settingStore.fullScreen === 3) {
    settingStore.fullScreen = 0;
  } else {
    settingStore.fullScreen = 3;
  }
}
function bodyFull() {
  if (settingStore.fullScreen === 1) {
    settingStore.fullScreen = 0;
  } else {
    ElMessage.info('按Esc键退出');
    settingStore.fullScreen = 1;
  }
}
defineExpose({
  bodyFull
});
</script>
<style lang="scss" scoped>
#header {
  height: var(--header-height);
  background-color: var(--header-bg-color);
  color: var(--header-text-color);
  box-shadow: var(--box-shadow);
  display: flex;
  > i {
    -webkit-app-region: no-drag;
    user-select: none;
    width: var(--header-height);
    height: var(--header-height);
    display: flex;
    font-size: calc(var(--header-height) * 0.5);
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
