<script setup lang="ts">
// import Loading from '@/components/status/Loading.vue';
// import SkeletonLoading from '@/components/status/SkeletonLoading.vue';
// import { useMainStore } from './stores';
import { ElConfigProvider } from 'element-plus';
import { ref } from 'vue';
// import type { EpPropMergeType } from 'element-plus/lib/utils/index.js';
import { useSettingStore } from './stores/setting';
// const mainStore = useMainStore();
const settingStore = useSettingStore();
settingStore.changeTheme(settingStore.theme);
//5秒后关闭loading
// nextTick(() => {
//   setTimeout(() => {
//     mainStore.setPageLoading(false);
//   }, 1);
// });
const zIndex = ref(3000);
</script>

<template>
  <el-config-provider :size="'large'" :z-index="zIndex">
    <RouterView />
    <!-- <div class="app-loading" v-show="mainStore.pageLoading">
      <Loading />
      <SkeletonLoading></SkeletonLoading>
    </div> -->
  </el-config-provider>
</template>

<style scoped lang="scss">
.app-loading {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: var(--content-bg-color);
  z-index: 2333;
}
</style>
