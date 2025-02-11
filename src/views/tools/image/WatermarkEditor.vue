<template>
  <div class="WatermarkEditor w-full h-full flex flex-col-reverse overflow-auto md:flex-row">
    <UploadFile
      @upload="uploadFiles"
      :dataType="[
        'image/apng',
        'image/avif',
        'image/bmp',
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/tiff',
        'image/webp'
      ]"
      :accept="'image/*'"
      :showPlaceholder="state.image === ''"
      class="h-4xl flex-shrink-0 md:flex-1 md:h-auto"
    >
      <canvas ref="_canvas" class="w-full h-full object-contain object-center"></canvas>
    </UploadFile>
    <el-form class="w-full h-auto flex-shrink-0 max-h-sm overflow-auto md:w-sm md:max-h-full">
      <el-form-item v-for="(item, index) in state.watermarks" :key="index">
        <el-input v-model="item.text">
          <template #prepend>
            <el-button :type="'primary'">
              <dynamic-icon :icon="'mingcute:text-2-fill'" class="icon"></dynamic-icon>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <IconSelector></IconSelector>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
const state = reactive({
  image: '',
  watermarks: [
    {
      icon: '',
      text: ''
    }
  ]
});
const _canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D;
onMounted(() => {
  if (_canvas.value) {
    ctx = _canvas.value.getContext('2d') as CanvasRenderingContext2D;
  }
});
function uploadFiles(files: File[] | null) {
  if (files) {
    state.image = URL.createObjectURL(files[0]);
    const img = new Image();
    img.src = state.image;
    img.onload = () => {
      if (_canvas.value) {
        _canvas.value.width = img.width;
        _canvas.value.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
    };
  }
}
</script>
<style lang="scss" scoped>
.WatermarkEditor {
  object-fit: contain;
}
</style>
