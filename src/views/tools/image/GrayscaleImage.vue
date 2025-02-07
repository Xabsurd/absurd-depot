<script setup lang="ts">
import { calculateCover } from '@/utils/opening';
import { reactive, ref, onMounted } from 'vue';
const state = reactive({ visible: false });
const _canvas = ref<HTMLCanvasElement>();
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D | null;
const inputRef = ref<HTMLInputElement>();
const boxRef = ref<HTMLElement>();
onMounted(() => {
  if (_canvas.value) {
    canvas = _canvas.value as HTMLCanvasElement;
    context = canvas.getContext('2d');
    console.log(context);
  }
  //添加拖入图片的功能
});
function boxDragover(e: DragEvent) {
  e.preventDefault();
}
function boxDrop(e: DragEvent) {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  console.log(file);
  if (file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      _render(img);
    };
  }
}
function handleClick() {
  if (inputRef.value) {
    inputRef.value.click();
  }
}
function uploadImage(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      _render(img);
    };
  }
}
function coverCanvas(width: number, height: number) {
  if (boxRef.value) {
    const cover = calculateCover(
      boxRef.value.clientWidth,
      boxRef.value.clientHeight,
      width,
      height
    );
    canvas.style.width = cover.width + 'px';
    canvas.style.height = cover.height + 'px';
    canvas.style.marginTop = `${cover.top}px`;
    canvas.style.marginLeft = `${cover.left}px`;
  }
}
function _render(img: HTMLImageElement) {
  state.visible = true;
  canvas.width = img.width;
  canvas.height = img.height;
  coverCanvas(img.width, img.height);
  context?.drawImage(img, 0, 0);
  //获取图片中每个像素的值
  const data = context?.getImageData(0, 0, canvas.width, canvas.height);
  if (data?.data) {
    //转换成灰度图
    const gray = new ImageData(canvas.width, canvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
      const grayValue =
        0.2126 * data.data[i] + 0.7152 * data.data[i + 1] + 0.0722 * data.data[i + 2];
      gray.data[i] = grayValue;
      gray.data[i + 1] = grayValue;
      gray.data[i + 2] = grayValue;
      gray.data[i + 3] = 255;
    }
    context?.putImageData(gray, 0, 0);
  }
}
</script>
<template>
  <div class="box" ref="boxRef" @drop="boxDrop" @dragover="boxDragover" @click="handleClick">
    <canvas ref="_canvas"></canvas>
    <span v-if="!state.visible">点击或拖入图片</span>
    <input type="file" ref="inputRef" @change="uploadImage" v-show="false" />
  </div>
</template>
<style scoped lang="scss">
.box {
  width: 100%;
  height: 100%;
  overflow: hidden !important;
  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
  }
}
</style>
