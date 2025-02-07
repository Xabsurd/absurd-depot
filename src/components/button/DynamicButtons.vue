<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
const state = reactive({});
const buttonRef = ref<HTMLElement>();
const obs = new ResizeObserver(() => {
  if (buttonRef.value) {
    //计算元素对角线的长度
    const len = Math.sqrt(
      Math.pow(buttonRef.value.clientWidth, 2) + Math.pow(buttonRef.value.clientHeight, 2)
    );
    buttonRef.value?.style.setProperty('--curSzie', len + 15 + 'px');
  }
});
onMounted(() => {
  if (buttonRef.value) {
    obs.observe(buttonRef.value);
  }
});
</script>
<template>
  <button class="dynamic-buttons" ref="buttonRef">
    <div class="dynamic-background"></div>
    <div class="dynamic-background blur"></div>
    <div class="content"><slot></slot></div>
  </button>
</template>
<style scoped lang="scss">
.dynamic-buttons {
  position: relative;
  --bg-color: var(--content-bg-color-light-3);
  --radius: var(--el-border-radius-base);
  --border-width: 0.5px;
  --start-color: rgb(251, 0, 255);
  --end-color: rgb(0, 128, 255);
  border: none;
  border-radius: var(--radius);
  background-color: transparent;
  transition: all var(--content-animation-time-same);
  .content {
    position: relative;
    padding: 8px 15px;
    border-radius: var(--radius);
    background-color: var(--bg-color);
  }
  &.large {
    --border-width: 1px;
    font-size: 1.5rem;
    .content {
      padding: 12px 20px;
    }
  }
  &.success {
    --start-color: rgb(0, 81, 255);
    --end-color: rgb(60, 255, 0);
  }
  &.warning {
    --start-color: rgb(187, 255, 0);
    --end-color: rgb(255, 94, 0);
  }
  &.danger {
    --start-color: rgb(255, 208, 0);
    --end-color: rgb(255, 0, 0);
  }
  .dynamic-background {
    overflow: hidden;
    position: absolute;
    inset: 0px;
    border-radius: var(--radius);
    transition: all var(--content-animation-time-same);
    &::before,
    &::after {
      content: '';
      position: absolute;
      background: linear-gradient(45deg, var(--start-color), var(--end-color));
      width: var(--curSzie);
      height: var(--curSzie);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: rotating 3s linear infinite;
    }
    &.blur {
      filter: blur(calc(var(--border-width) * 2));
    }
  }
  &:hover {
    .dynamic-background {
      inset: calc(var(--border-width) * -5);
      &.blur {
        filter: blur(calc(var(--border-width) * 10));
      }
    }
  }
  &:active {
    .dynamic-background {
      inset: calc(var(--border-width) * -5);
      &.blur {
        inset: calc(var(--border-width) * -10);
        filter: blur(calc(var(--border-width) * 20));
      }
    }
  }
}
@keyframes rotating {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
