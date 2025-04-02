<template>
  <div class="moving-circle" ref="movingCircleRef">
    <div class="filter">
      <div
        class="circle-item"
        v-for="item in state.circles"
        :key="item.index"
        :style="{
          left: item.left + 'px',
          top: item.top + 'px',
          width: item.width + 'px',
          height: item.height + 'px',
          backgroundColor: item.color,
          '--animationDuration': `${item.delay}ms`
        }"
      ></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
const state = reactive({
  circles: [] as {
    index: number;
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    timer: number;
    movingNumber: number;
    delay: number;
    nextPosition: () => void;
    startMove: () => void;
    stopMove: () => void;
  }[],
  delay: 10000
});
// let timer: number;
const movingCircleRef = ref<HTMLDivElement>();
onMounted(() => {
  const number = 10;
  for (let i = 0; i < number; i++) {
    state.circles.push({
      index: i,
      top: 0,
      left: 0,
      width: 666,
      height: 666,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      timer: 0,
      delay: state.delay,
      movingNumber: -1,
      nextPosition: function () {
        if (this.movingNumber < 1) {
          this.delay = state.delay + (number / this.index) * state.delay;
        } else {
          this.delay = state.delay;
        }
        this.movingNumber++;
        this.left = Math.random() * movingCircleRef.value!.offsetWidth;
        this.top = Math.random() * movingCircleRef.value!.offsetHeight;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      },
      startMove: function () {
        this.nextPosition();
        this.timer = setTimeout(() => {
          this.startMove();
        }, this.delay);
      },
      stopMove: function () {
        clearInterval(this.timer);
      }
    });
    state.circles[i].nextPosition();
    nextTick(() => {
      state.circles[i].startMove();
    });
  }
});
onBeforeUnmount(() => {
  // if (timer) {
  //   clearInterval(timer);
  // }
});
</script>
<style lang="css" scoped>
.moving-circle {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .filter {
    filter: blur(100px);
    .circle-item {
      position: absolute;
      transition: all cubic-bezier(0.6, 0.15, 0.55, 1.45) var(--animationDuration);
      transform: translate(-50%, -50%);
      border-radius: 50%;
      opacity: 0.05;
      /* background-color: var(--backgroundColor); */
    }
  }
}
</style>
