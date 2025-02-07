<template>
  <header id="header">
    <!-- <i
      class="iconfont"
      :class="settingStore.menuCollapse ? 'icon-indent' : 'icon-outdent'"
      id="Collapse"
      @click="changeMenuCollapse"
    ></i>
    <i
      class="full iconfont"
      :class="[settingStore.fullScreen === 3 ? 'icon-fullscreen-exit' : 'icon-fullscreen']"
      @click="fullClick"
    ></i>
    <i
      class="full iconfont"
      :class="[settingStore.fullScreen === 1 ? 'icon-compress' : 'icon-expend']"
      @click="bodyFull"
    ></i> -->
    <Icon :icon="'mingcute:indent-decrease-fill'"></Icon>
  </header>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { getCurrentInstance } from 'vue';
import { useSettingStore } from '@/stores/setting';
import Icon from '@/components/icons/DynamicIcon.vue';
const test = getCurrentInstance();
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
