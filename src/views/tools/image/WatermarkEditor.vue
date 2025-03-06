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
      :showPlaceholder="state.imageUrl === ''"
      class="h-4xl flex-shrink-0 md:flex-1 md:h-auto"
    >
      <canvas ref="_canvas" class="w-full h-full object-contain object-center"></canvas>
    </UploadFile>
    <el-form class="w-full h-auto flex-shrink-0 max-h-sm overflow-auto md:w-sm md:max-h-full">
      <el-form-item v-for="(item, index) in state.watermarks" :key="index">
        <el-input v-model="item.text" @input="handleValueChange">
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
  imageUrl: '',
  image: new Image(),
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
    state.imageUrl = URL.createObjectURL(files[0]);
    state.image.src = state.imageUrl;
    state.image.onload = () => {
      if (_canvas.value) {
        _canvas.value.width = state.image.width;
        _canvas.value.height = state.image.height;
        ctx.drawImage(state.image, 0, 0);
      }
    };
  }
}
function handleValueChange() {
  if (_canvas.value) {
    for (let i = 0; i < state.watermarks.length; i++) {
      const element = state.watermarks[i];
      console.log(element);
      ctx.font = '160px bold serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.clearRect(0, 0, _canvas.value.width, _canvas.value.height);
      ctx.drawImage(state.image, 0, 0);
      ctx.fillText(element.text, _canvas.value.width / 2, _canvas.value.height / 2);
    }
  }
}
</script>
<style lang="scss" scoped>
.WatermarkEditor {
  object-fit: contain;
  overflow: hidden;
}
</style>
