<template>
  <div
    class="uploadFile relative"
    :class="{ 'is-over-drop-zone': isOverDropZone && !disabled }"
    ref="uploadFile"
    @click="inputRef?.click()"
  >
    <slot></slot>
    <slot name="placeholder" v-if="props.showPlaceholder">
      <div class="placeholder absolute w-full h-full top-0 left-0 flex items-center justify-center">
        点击或拖入图片上传
      </div>
    </slot>
    <input type="file" ref="inputRef" @change="uploadImage" v-show="false" :accept="props.accept" />
  </div>
</template>
<script setup lang="ts">
import { useDropZone } from '@vueuse/core';
const emits = defineEmits<{
  (event: 'upload', files: File[] | null): void;
}>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    dataType?: MaybeRef<readonly string[]> | ((types: readonly string[]) => boolean);
    accept?: string;
    showPlaceholder?: boolean;
  }>(),
  {
    showPlaceholder: true
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
    emits('upload', files);
  }
}
function uploadImage(e: Event) {
  if (!props.disabled) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    emits('upload', files as unknown as File[]);
  }
}
</script>
<style lang="scss" scoped>
.uploadFile {
  &.is-over-drop-zone {
    border: 2px dashed var(--el-color-primary);
  }
}
</style>
