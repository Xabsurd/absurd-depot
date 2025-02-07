<template>
  <div class="OverPointCurve">
    <div class="tip">左键点击添加点，右键点击完成</div>
    <canvas
      ref="canvasRef"
      @click="handleClick"
      @mousemove="handleMove"
      @contextmenu="handleRClick"
    ></canvas>
  </div>
</template>
<script setup lang="ts">
import { useSettingStore } from '@/stores/setting';
import { BezierCurve } from '@/utils/calculate/bezierCurve';
import { type Point } from '@/utils/calculate/geometric';
import { computed, onMounted, reactive, ref } from 'vue';

const settingStore = useSettingStore();
const canvasRef = ref<HTMLCanvasElement>();
let resizeObs = new ResizeObserver(handleResize);
let context: CanvasRenderingContext2D | null;
let canDraw = false;
/**
 * 是否闭合
 */
let close = true;
let points: Point[] = [];
const bezierCurve = new BezierCurve(points, close);
const state = reactive({
  dotSize: 5
});
const colors = computed(() => {
  if (settingStore.appliedTheme === 'dark') {
    return { fillStyle: '#fff', strokeStyle: '#fff' };
  } else {
    return { fillStyle: '#000', strokeStyle: '#000' };
  }
});

const cacheImageData = {
  redDot: getDotImage('red'),
  greenDot: getDotImage('#0f0'),
  blueDot: getDotImage('blue')
};

onMounted(() => {
  if (canvasRef.value) {
    resizeObs.observe(canvasRef.value);
    context = canvasRef.value.getContext('2d');
  }
});
function getDotImage(color: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    canvas.width = state.dotSize;
    canvas.height = state.dotSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(state.dotSize / 2, state.dotSize / 2, state.dotSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
  return canvas;
}

function handleClick(e: MouseEvent) {
  if (!canDraw) {
    canDraw = true;
    points = [];
    bezierCurve.centerPoints = [];
  }
  if (points.length < 1) {
    points.push({ x: e.offsetX, y: e.offsetY });
  }
  points[points.length - 1] = { x: e.offsetX, y: e.offsetY };
  points.push({ x: e.offsetX, y: e.offsetY });
  bezierCurve.points = points;
  bezierCurve.calculatControlPoints();

  draw();
}
function handleRClick(e: MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
  points[points.length - 1] = { x: e.offsetX, y: e.offsetY };
  // points.push({ x: e.offsetX, y: e.offsetY });
  bezierCurve.points = points;
  bezierCurve.calculatControlPoints();
  draw();
  canDraw = false;
}
function handleMove(e: MouseEvent) {
  if (canDraw) {
    // if (e.ctrlKey) {
    //   this.handleClick(e);
    // }
    if (points.length >= 1) {
      points[points.length - 1] = { x: e.offsetX, y: e.offsetY };
      bezierCurve.points = points;
      bezierCurve.calculatControlPoints();
      draw();
    }
  }
}
function handleResize() {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.clientWidth;
    canvasRef.value.height = canvasRef.value.clientHeight;
    //   context.putImageData(this.imgData, 0, 0);
    draw();
  }
}
function draw() {
  if (!canvasRef.value || !context || points.length < 1) return;
  const controlPoints = bezierCurve.getControlPoints();
  // const centerPoints = bezierCurve.centerPoints;
  context.fillStyle = colors.value.fillStyle;
  context.strokeStyle = colors.value.strokeStyle;
  context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  //绘制线条
  context.lineWidth = 2;
  context.beginPath();
  if (controlPoints.length > 0) {
    //绘制曲线
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const controlPoint = controlPoints[i - 1];
      context.bezierCurveTo(
        controlPoint.p1.x,
        controlPoint.p1.y,
        controlPoint.p2.x,
        controlPoint.p2.y,
        point.x,
        point.y
      );
    }
    //绘制闭合曲线
    if (close && points.length > 2) {
      let p1 = controlPoints[controlPoints.length - 1].p1;
      let p2 = controlPoints[controlPoints.length - 1].p2;
      context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, points[0].x, points[0].y);
    }
    context.closePath();
    context.stroke();
    context.fill();
    context.restore();

    context.beginPath();
    for (let i = 0; i < controlPoints.length; i++) {
      const cp = controlPoints[i];
      context.strokeStyle = '#0f0';
      context.moveTo(cp.p1.x, cp.p1.y);
      context.lineTo(points[i].x, points[i].y);
      context.moveTo(cp.p2.x, cp.p2.y);
      context.lineTo(
        points[i + 1 > points.length - 1 ? 0 : i + 1].x,
        points[i + 1 > points.length - 1 ? 0 : i + 1].y
      );
    }
    context.stroke();
    context.fill();
    context.restore();
    // 绘制控制点
    for (let i = 0; i < controlPoints.length; i++) {
      const cp = controlPoints[i];
      context.fillStyle = '#f00';
      context.drawImage(
        cacheImageData.greenDot!,
        cp.p1.x - state.dotSize / 2,
        cp.p1.y - state.dotSize / 2
      );
      context.drawImage(
        cacheImageData.greenDot!,
        cp.p2.x - state.dotSize / 2,
        cp.p2.y - state.dotSize / 2
      );
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      context.drawImage(
        cacheImageData.redDot!,
        point.x - state.dotSize / 2,
        point.y - state.dotSize / 2
      );
    }

    // context.stroke();
    // context.restore();
    // 绘制中心点
    // context.beginPath();
    // for (let i = 0; i < centerPoints.length; i++) {
    //   const cp = centerPoints[i];
    //   context.fillStyle = '#0f0';
    //   context.fillRect(cp.x, cp.y, 5, 5);
    // }
  } else {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
    context.closePath();
    context.stroke();
    context.restore();
    context.drawImage(
      cacheImageData.redDot!,
      points[1].x - state.dotSize / 2,
      points[1].y - state.dotSize / 2
    );
    context.drawImage(
      cacheImageData.redDot!,
      points[0].x - state.dotSize / 2,
      points[0].y - state.dotSize / 2
    );
  }
}
</script>

<style lang="scss" scoped>
.OverPointCurve {
  width: 100%;
  height: 100%;
  display: flex;
  > canvas {
    width: 100%;
    height: 100%;
  }
  .tip {
    position: absolute;
    pointer-events: none;
  }
}
</style>
