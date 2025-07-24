<template>
  <div id="Layout">
    <MovingCircle class="absurd-background"></MovingCircle>
    <Sider></Sider>
    <div id="Content">
      <Header v-show="state.headerShow" ref="header"></Header>
      <div id="ContentView" ref="ContentView" class="m-2 lg:m-4">
        <AnimationRouter></AnimationRouter>
        <div class="router-loading" v-if="mainStore.routerLoading">
          <Loading />
        </div>
      </div>
      <div v-if="!settingStore.menuCollapse" id="ContentMark" @click="hideMenu"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sider from './Sider.vue';
import Header from './Header.vue';
import { useSettingStore } from '@/stores/setting';
import { beFull, exitFull } from '../../utils/fullScreen';
import { reactive, ref, watch, onBeforeUnmount, onMounted } from 'vue';
import { hideMenu, windowKeyDown, windowResize } from './methods/layout';
import AnimationRouter from './components/AnimationRouter.vue';
import { useMainStore } from '@/stores';
import Loading from '@/components/status/Loading.vue';
import MovingCircle from '@/components/MovingCircle.vue';
//全局状态
const settingStore = useSettingStore();
const mainStore = useMainStore();
//doms
const ContentView = ref(undefined);
const header = ref(undefined);
//局部状态
const state = reactive({ headerShow: true });

//数据监听
watch(
  () => settingStore.fullScreen,
  (data) => {
    switch (data) {
      case 1:
        settingStore.menuCollapse = true;
        state.headerShow = false;
        break;
      case 2:
        beFull(ContentView.value);
        break;
      case 3:
        beFull(document.body);
        break;
      default:
        exitFull();
        settingStore.menuCollapse = false;
        state.headerShow = true;
        break;
    }
  }
);
//生命周期
onMounted(() => {
  window.addEventListener('resize', windowResize);
  window.addEventListener('keydown', windowKeyDown);
  windowResize();
});
onBeforeUnmount(() => {});
defineExpose({
  ContentView,
  state
});
</script>

<style lang="scss" scoped>
#Layout {
  display: flex;
  height: 100%;
  width: 100%;

  .absurd-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    background-color: var(--content-bg-color);
  }
  #Content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    #ContentView {
      flex: 1;
      overflow: hidden;
      position: relative;
      color: var(--content-text-color);

      > div {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .router-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }

    #ContentMark {
      display: none;
    }
  }
}

@screen lt-lg {
  #Layout {
    #Content {
      min-width: 100%;

      #ContentMark {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        opacity: 0.5;
      }
    }
  }
}
</style>
