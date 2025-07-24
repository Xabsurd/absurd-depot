<template>
  <div class="image-canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      class="image-canvas"
      @mousedown="startDrag"
      @mousemove="dragImage"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @wheel="zoomImage"
      @click="addPoint"
    ></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  points: {
    type: Array as () => Array<{ id: number; x: number; y: number; color: string; diff: string }>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'update-points', points: typeof props.points): void
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const image = ref<HTMLImageElement | null>(null);
const translateX = ref(0);
const translateY = ref(0);
const scale = ref(1);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const nextId = ref(0);

function calculateColorDiff(color1: string, color2: string): string {
  const rgba1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0, 0];
  const rgba2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0, 0];
  const diff = rgba1.map((v, i) => Math.abs(v - rgba2[i]));
  const total = diff.reduce((a, b) => a + b, 0);
  return `总差值: ${total}, R: ${diff[0]}, G: ${diff[1]}, B: ${diff[2]}, A: ${diff[3]}`;
}

function drawCanvas() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !image.value) return;

  // 设置画布尺寸
  const container = containerRef.value;
  if (!container) return;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // 清空并绘图
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imgW = image.value.width, imgH = image.value.height;
  const scaleX = canvas.width / imgW, scaleY = canvas.height / imgH;
  const imgScale = Math.min(scaleX, scaleY) * scale.value;
  const offsetX = (canvas.width - imgW * imgScale) / 2 + translateX.value;
  const offsetY = (canvas.height - imgH * imgScale) / 2 + translateY.value;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(imgScale, imgScale);
  ctx.drawImage(image.value, 0, 0);
  ctx.restore();

  // 绘制点位
  props.points.forEach(pt => {
    const cx = offsetX + pt.x * imgScale;
    const cy = offsetY + pt.y * imgScale;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = pt.color;
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  });
}

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
}

function dragImage(event: MouseEvent) {
  if (!isDragging.value) return;
  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;
  translateX.value += dx;
  translateY.value += dy;
  startX.value = event.clientX;
  startY.value = event.clientY;
  drawCanvas();
}

function endDrag() {
  isDragging.value = false;
}

function zoomImage(event: WheelEvent) {
  event.preventDefault();
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !image.value) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const oldScale = scale.value;
  const zoomFactor = 0.1;
  let newScale = oldScale + (event.deltaY < 0 ? zoomFactor : -zoomFactor);
  newScale = Math.max(0.1, Math.min(newScale, 10)); // 限制范围

  // 计算偏移
  const imgW = image.value.width;
  const imgH = image.value.height;
  const cw = canvas.width;
  const ch = canvas.height;
  const offsetOldX = (cw - imgW * oldScale) / 2;
  const offsetOldY = (ch - imgH * oldScale) / 2;
  const offsetNewX = (cw - imgW * newScale) / 2;
  const offsetNewY = (ch - imgH * newScale) / 2;

  // 计算世界坐标
  const worldX = (mouseX - offsetOldX - translateX.value) / oldScale;
  const worldY = (mouseY - offsetOldY - translateY.value) / oldScale;

  // 更新 scale 和 translate
  scale.value = newScale;
  translateX.value = mouseX - offsetNewX - worldX * newScale;
  translateY.value = mouseY - offsetNewY - worldY * newScale;

  drawCanvas();
}

function addPoint(event: MouseEvent) {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !image.value) return;
  const rect = canvas.getBoundingClientRect();
  const xCanvas = event.clientX - rect.left;
  const yCanvas = event.clientY - rect.top;

  // 取色
  const data = ctx.getImageData(xCanvas, yCanvas, 1, 1).data;
  const color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

  // 计算原图坐标
  const imgW = image.value.width, imgH = image.value.height;
  const scaleX = canvas.width / imgW, scaleY = canvas.height / imgH;
  const imgScale = Math.min(scaleX, scaleY) * scale.value;
  const offsetX = (canvas.width - imgW * imgScale) / 2 + translateX.value;
  const offsetY = (canvas.height - imgH * imgScale) / 2 + translateY.value;
  const x = (xCanvas - offsetX) / imgScale;
  const y = (yCanvas - offsetY) / imgScale;

  // 计算差值
  const last = props.points[props.points.length - 1];
  const diff = last ? calculateColorDiff(last.color, color) : 'N/A';

  const newPts = [...props.points, { id: nextId.value++, x, y, color, diff }];
  emit('update-points', newPts);
  drawCanvas();
}

watch(() => props.imageUrl, (newUrl) => {
  if (!newUrl) return;
  const img = new Image();
  img.src = newUrl;
  img.onload = () => {
    image.value = img;

    // 自适应到画布大小
    const canvas = canvasRef.value;
    const container = containerRef.value;
    if (!canvas || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const imgAspect = img.width / img.height;
    const contAspect = cw / ch;

    let baseScale = 1;
    if (imgAspect > contAspect) {
      baseScale = cw / img.width;
    } else {
      baseScale = ch / img.height;
    }
    scale.value = baseScale;
    translateX.value = 0;
    translateY.value = 0;

    drawCanvas();
  };
});

onMounted(() => {
  const container = containerRef.value;
  if (container) {
    const resizeObserver = new ResizeObserver(drawCanvas);
    resizeObserver.observe(container);
  }

  // 确保首次加载时画布正确绘制
  if (props.imageUrl) {
    const img = new Image();
    img.src = props.imageUrl;
    img.onload = () => {
      image.value = img;
      drawCanvas();
    };
  }
});
</script>

<style scoped>
.image-canvas-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.image-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}
.image-canvas:active {
  cursor: grabbing;
}
</style>
