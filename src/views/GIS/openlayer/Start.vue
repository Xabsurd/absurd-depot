<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
const state = reactive({});
let map: Map;
const mapRef = ref(null);
function initMap() {
  if (mapRef.value) {
    var vectorSource = new VectorSource({
      url: './assets/geojson/output.geojson',
      format: new GeoJSON({
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857'
      })
    });

    var vectorLayer = new VectorLayer({
      source: vectorSource
    });
    map = new Map({
      layers: [
        // new TileLayer({
        //   source: new OSM()
        // }),
        vectorLayer
      ],
      target: mapRef.value,
      view: new View({
        center: [81202.20486102329, 44922.82150565888],
        zoom: 10
      })
    });
    map.on('moveend', mapMoveend);
  }

  console.log('init finished');
}
function mapMoveend() {
  if (map) {
    const view = map.getView();
    console.log(view.getCenter());
    console.log(view.getZoom());
  }
}
onMounted(() => {
  initMap();
});

</script>
<template>
  <div class="mapbox">
    <div class="map" ref="mapRef"></div>
  </div>
</template>
<style scoped lang="scss">
.mapbox {
  &,.map {
    width: 100%;
    height: 100%;
  }
}
</style>
