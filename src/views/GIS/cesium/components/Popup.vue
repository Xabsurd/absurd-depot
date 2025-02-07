<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import type { Viewer, Cartesian3 } from 'cesium';
import { defined, EllipsoidalOccluder } from 'cesium';
const props = defineProps<{ viewer: Viewer }>();
const viewer = props.viewer;
const state = reactive({
  popups: [],
  trackPoint: null as Cartesian3 | null,
  visible: false,
  position: {
    x: 0,
    y: 0
  },
  isPointVisible: false,
  intersection: undefined as Cartesian3 | undefined
});
onMounted(() => {
  viewer.scene.postRender.addEventListener(getPopupPosition);
});
onUnmounted(() => {
  viewer.scene.postRender.removeEventListener(getPopupPosition);
});
function getPopupPosition() {
  if (state.trackPoint) {
    // let direction = Cesium.Cartesian3.normalize(
    //   Cesium.Cartesian3.subtract(state.trackPoint, viewer.camera.position, new Cesium.Cartesian3()),
    //   new Cesium.Cartesian3()
    // );
    // // 建立射线
    // let ray = new Cesium.Ray(viewer.camera.position, direction);
    // if (ray) {
    //   const intersection = viewer.scene.pickFromRay(ray);
    //   console.log(intersection);
    //   if (defined(intersection)) {
    //     console.log(1);
    //   }
    // }
    state.isPointVisible = new EllipsoidalOccluder(
      viewer.scene.globe.ellipsoid,
      viewer.camera.position
    ).isPointVisible(state.trackPoint);
    const position = viewer.scene.cartesianToCanvasCoordinates(state.trackPoint);
    if (position) {
      state.position.x = position.x;
      state.position.y = position.y;
    }
  }
}
function openPopup(data: OpenPopupData) {
  console.log(data);

  state.trackPoint = data.point;
  state.visible = true;
}
function closePopup() {}
defineExpose({
  openPopup: openPopup,
  closePopup: closePopup
});
export interface OpenPopupData {
  point: Cartesian3;
}
export interface PopupRef {
  openPopup: (data: OpenPopupData) => void;
  closePopup: () => void;
}
</script>
<template>
  <div
    class="custom_popup"
    v-if="state.visible && state.isPointVisible"
    :style="{ left: state.position.x + 'px', top: state.position.y + 'px' }"
  >
    <div class="popup_header">
      <slot name="header"></slot>
      <i class="el-icon-close" @click="state.visible = false"></i>
    </div>
    <div class="popup_body">
      {{ state.intersection }}
      <slot></slot>
    </div>
  </div>
</template>
<style scoped lang="scss">
.custom_popup {
  position: absolute;
  background-color: var(--el-bg-color-overlay);
  padding: var(--popover-padding);
  pointer-events: all;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-light);
  transform: translate(-50%, calc(-100% - 20px));
  width: 200px;
  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    bottom: -5px;
    left: 50%;
    box-sizing: border-box;
    transform: rotate(45deg) translate(-35%, 35%);
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-top-color: transparent !important;
    border-left-color: transparent !important;
  }
}
</style>
