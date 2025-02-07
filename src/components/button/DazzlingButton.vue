<script setup lang="ts">
import { reactive, ref } from 'vue';
const state = reactive({});
</script>
<template>
  <button type="button" class="dazzling-button">
    <div class="dazzling-button-background"></div>
    <div class="content">
      <slot></slot>
    </div>
  </button>
</template>
<style scoped lang="scss">
.dazzling-button {
  position: relative;
  --bg-color: var(--content-bg-color-light-3);
  --border-width: 0.5px;
  --deg: 45deg;
  --start-color: var(--el-color-primary-light-7);
  --end-color: var(--el-color-primary);
  --bg-opacity: 0.5;
  background-color: var(--bg-color);
  border: none;
  border-radius: var(--el-border-radius-base);
  margin: 0 5px;
  .content {
    position: relative;
    z-index: 2;
    inset: 0px;
    padding: 8px 15px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--bg-color);
  }
  &.large {
    font-size: 1.5rem;
    --border-width: 1px;
    .content {
      padding: 12px 20px;
    }
  }
  &.success {
    --start-color: var(--el-color-success-light-7);
    --end-color: var(--el-color-success);
  }
  &.warning {
    --start-color: var(--el-color-warning-light-7);
    --end-color: var(--el-color-warning);
  }
  &.danger {
    --start-color: var(--el-color-danger-light-7);
    --end-color: var(--el-color-danger);
  }

  .dazzling-button-background {
    position: absolute;
    inset: 0px;
    &::before,
    &::after {
      content: '';
      display: block;
      background: linear-gradient(45deg, var(--start-color), var(--end-color));
      position: absolute;
      inset: calc(var(--border-width) * -0.5);
      z-index: 1;
      transition: all var(--content-animation-time-same);
      border-radius: var(--el-border-radius-base);
    }
    &::after {
      filter: blur(calc(var(--border-width) * 2));
    }
  }
  &:hover .dazzling-button-background::before,
  &:hover .dazzling-button-background::after {
    inset: calc(var(--border-width) * -5);
  }
  &:hover .dazzling-button-background::after {
    filter: blur(calc(var(--border-width) * 10));
  }
  &:active .dazzling-button-background::after {
    inset: calc(var(--border-width) * -10);
    filter: blur(calc(var(--border-width) * 20));
  }
}
</style>
