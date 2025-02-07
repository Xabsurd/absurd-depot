<script setup lang="ts" type="module">
import AnimationRouter from '@/views/layout/components/AnimationRouter.vue';
import { nextTick, onMounted, reactive, ref } from 'vue';
import {
  Cartesian3,
  Ion,
  ScreenSpaceEventType,
  Viewer,
  createWorldTerrainAsync,
  Math as CMath
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
// import cesium from 'https://cdn.jsdelivr.net/npm/cesium@1.117.0/+esm';
import { cesium_token } from '@/utils/config';
window.CESIUM_BASE_URL = './libs/Cesium';
const cesiumContainer = ref<HTMLElement>();
const state = reactive({
  loaded: false
});

// Your access token can be found at: https://ion.cesium.com/tokens.
// Replace `your_access_token` with your Cesium ion access token.
Ion.defaultAccessToken = cesium_token;
let viewer = reactive<Viewer>({} as any);
onMounted(async () => {
  if (!cesiumContainer.value) {
    return;
  }
  // Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
  viewer = new Viewer(cesiumContainer.value, {
    terrainProvider: await createWorldTerrainAsync(),
    selectionIndicator: false,
    timeline: false,
    animation: false,
    infoBox: false
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // Add Cesium OSM Buildings, a global 3D buildings layer.
  // const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
  // Fly the camera to San Francisco at the given longitude, latitude, and height.
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
      heading: CMath.toRadians(0.0),
      pitch: CMath.toRadians(-15.0)
    }
  });

  nextTick(() => {
    state.loaded = true;
  });
});
</script>
<template>
  <div class="cesium">
    <div class="cesiumContainer" ref="cesiumContainer"></div>
    <div class="cesiumFunction" v-if="state.loaded">
      <AnimationRouter :viewer="viewer"></AnimationRouter>
    </div>
  </div>
</template>
<style scoped lang="scss">
.cesium {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
  > div {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .cesiumFunction {
    pointer-events: none;
    > div {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
