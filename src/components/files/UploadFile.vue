<template>
  <div
    class="uploadFile relative"
    :class="{ 'is-over-drop-zone': isOverDropZone && !disabled }"
    ref="uploadFile"
    @click="!props.disableClick && inputRef?.click()"
  >
    <slot></slot>
    <slot name="placeholder" v-if="props.showPlaceholder">
      <div class="placeholder absolute w-full h-full top-0 left-0 flex items-center justify-center">
        <p><DynamicIcon icon="mingcute:upload-2-fill"></DynamicIcon></p>
        <p>点击或拖入图片上传</p>
      </div>
    </slot>
    <input
      type="file"
      ref="inputRef"
      @change="uploadImage"
      v-show="false"
      :accept="props.accept"
      :multiple="props.multiple"
    />
  </div>
</template>
<script setup lang="ts">
import { useDropZone } from '@vueuse/core';
const emits = defineEmits<{
  (event: 'upload', files: FileList | null): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    dataType?: MaybeRef<readonly string[]> | ((types: readonly string[]) => boolean);
    accept?: string;
    showPlaceholder?: boolean;
    multiple?: boolean;
    disableClick?: boolean; // 新增属性
  }>(),
  {
    showPlaceholder: true,
    multiple: true,
    disableClick: false // 默认允许点击上传
  }
);
const uploadFile = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const { isOverDropZone } = useDropZone(uploadFile, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: props.dataType,
  // control multi-file drop
  multiple: true,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
});
function onDrop(files: File[] | null) {
  if (!props.disabled) {
    emits('upload', files as FileList | null);
  }
}
function uploadImage(e: Event) {
  if (!props.disabled) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    emits('upload', files as FileList | null);
  }
}
</script>
<style lang="scss" scoped>
.uploadFile {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: 2px dashed var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease-in-out;
  &.is-over-drop-zone {
    border: 2px dashed var(--el-color-primary);
  }
  i {
    font-size: 24px;
    color: var(--el-color-primary);
  }
  .placeholder {
    color: var(--el-text-color-placeholder);
    font-size: 16px;
  }
}
</style>
