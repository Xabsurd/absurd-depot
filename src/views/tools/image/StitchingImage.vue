<template>
  <el-row :gutter="20" class="stitching-image" style="overflow: hidden; height: 100%; margin: 0">
    <!-- Left: Controls -->
    <el-col :span="8">
      <el-form label-width="90px">
        <el-form-item label="上传图片">
          <UploadFile @upload="handleUpload" style="width: 100%; height: 350px" />
        </el-form-item>
        <el-form-item label="排列方向">
          <el-radio-group v-model="direction">
            <el-radio label="horizontal">横向</el-radio>
            <el-radio label="vertical">纵向</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="direction === 'horizontal' ? '行数' : '列数'"
        >
          <el-input-number
            v-model="lines"
            :min="1"
            :max="images?.length || 1"
            @change="renderGrids"
          />
        </el-form-item>
        <el-form-item label="边框大小">
          <el-input-number v-model="borderSize" :min="0" :max="20" />
        </el-form-item>
        <el-form-item label="边框颜色">
          <el-color-picker v-model="borderColor" />
        </el-form-item>
        <el-form-item
          v-if="direction === 'horizontal'"
          :label="direction === 'horizontal' ? '行高' : '列宽'"
        >
          <el-input-number v-model="size" :min="10" :max="10000" />
        </el-form-item>
        <el-form-item label="预览缩放">
          <el-slider v-model="zoom" :min="0.25" :max="4" :step="0.01" show-input />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="exportPreviewToCanvas" style="margin-bottom: 10px;">导出为图片</el-button>

    </el-col>
    <!-- Right: Image Preview -->
    <el-col ref="imagePreview" :span="16" style="overflow: auto; height: 100%" :style="{ display: 'flex', flexDirection: direction === 'horizontal' ? 'column' : 'row' }">
      <template v-for="(rows, index) in grids" :key="index">
        <VueDraggable
          v-model="grids[index]"
          :animation="200"
          :group="{ name: 'images', pull: true, put: true }"
          :style="{
            display: 'flex',
            flexDirection: direction === 'horizontal' ? 'row' : 'column',
            width: direction === 'horizontal' ? 'auto' : size * zoom + 'px',
            height: direction === 'horizontal' ? size * zoom + 'px' : 'auto'
          }"
        >
          <img
            v-for="(image, imgIndex) in rows"
            :key="imgIndex"
            :src="image?.url"
            :alt="image?.name"
            :style="{
              height: direction === 'horizontal' ? size * zoom + 'px' : 'auto',
              width: direction === 'horizontal' ? 'auto' : size * zoom + 'px',
              border: `${borderSize}px solid ${borderColor}`
            }"
            class="stitching-image-item"
          />
        </VueDraggable>
      </template>
    </el-col>
  </el-row>
  <el-dialog v-model="showCanvasDialog" width="80%" :before-close="handleClose">
    <template #title>
      <span>预览画布</span>
    </template>
    <div style="text-align: center">
      <img :src="previewCanvasUrl" style="max-width: 100%; height: auto" />
    </div>
    <div style="text-align: right; margin-top: 10px">
      <el-button @click="showCanvasDialog = false">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type {  ElCol } from 'element-plus';
import type { SFCWithInstall } from 'element-plus/es/utils/index.mjs';
type ImageItem = {
  url: string;
  name?: string;
  size?: {
    width: number;
    height: number;
  };
  type?: string;
};
const images = ref<ImageItem[]>([]);
const direction = ref('horizontal');
const lines = ref(1);
const grids = ref<ImageItem[][]>([]);
const borderSize = ref(0);
const borderColor = ref('#ffffff');
const size = ref(1024);
const zoom = ref(1);
const showCanvasDialog = ref(false);
const previewCanvasUrl = ref('');
const imagePreview = ref<SFCWithInstall<typeof ElCol>>();
function handleUpload(files: FileList | null) {
  if (files === null || files.length === 0) {
    console.warn('No files uploaded');
    images.value = [];
    grids.value = [];
    return;
  }
  const loadImage = (file: File) => {
    return new Promise<ImageItem>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        resolve({
          url,
          name: file.name,
          size: { width: img.width, height: img.height },
          type: file.type
        });
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${file.name}`);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
    });
  };

  Promise.all(Array.from(files).map(loadImage))
    .then((loadedImages) => {
      images.value = loadedImages;
      renderGrids();
      console.log(grids.value);
    })
    .catch((err) => {
      console.error('Some images failed to load', err);
      images.value = [];
      renderGrids();
    });
}
function renderGrids() {
  grids.value = [];
  const lineSize = Math.floor(images.value.length / lines.value);
  const extra = images.value.length % lines.value;
  for (let i = 0; i < lines.value; i++) {
    if (i < extra) {
      grids.value.push(images.value.slice(i * lineSize + i, (i + 1) * lineSize + i + 1));
    } else {
      grids.value.push(images.value.slice(i * lineSize + extra, (i + 1) * lineSize + extra));
    }
  }
}

async function exportPreviewToCanvas() {
  await nextTick();
  // 获取所有图片 DOM
  const preview = imagePreview.value?.$el as HTMLElement | null;
  if (!preview) return;
  const imgEls = preview.querySelectorAll('img');
  if (!imgEls.length) return;

  // 计算整体画布尺寸
  let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
  const imgRects: {el: HTMLImageElement, left: number, top: number, width: number, height: number}[] = [];
  imgEls.forEach((img: HTMLImageElement) => {
    const rect = img.getBoundingClientRect();
    const parentRect = preview.getBoundingClientRect();
    const left = rect.left - parentRect.left;
    const top = rect.top - parentRect.top;
    minLeft = Math.min(minLeft, left);
    minTop = Math.min(minTop, top);
    maxRight = Math.max(maxRight, left + rect.width);
    maxBottom = Math.max(maxBottom, top + rect.height);
    imgRects.push({el: img, left, top, width: rect.width, height: rect.height});
  });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(maxRight - minLeft);
  canvas.height = Math.ceil(maxBottom - minTop);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 绘制所有图片
  for (const {el, left, top, width, height} of imgRects) {
    // 需要等图片加载完成
    await new Promise<void>(resolve => {
      if (el.complete) resolve();
      else el.onload = () => resolve();
    });
    ctx.drawImage(el, left - minLeft, top - minTop, width, height);
  }

  previewCanvasUrl.value = canvas.toDataURL('image/png');
  showCanvasDialog.value = true;
}

function handleClose() {
  showCanvasDialog.value = false;
}
</script>
<style scoped>
.stitching-image-item{
  user-select: none;
}
</style>
