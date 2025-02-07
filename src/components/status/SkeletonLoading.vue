<script setup lang="ts">
import { reactive, ref } from 'vue';
const state = reactive({});
const props = withDefaults(
  defineProps<{
    type: 'content' | 'form';
  }>(),
  {
    type: 'content'
  }
);
</script>
<template>
  <div class="skeleton-loading">
    <el-skeleton
      animated
      style="display: flex; flex-direction: column"
      v-if="props.type === 'content'"
    >
      <template #template>
        <el-skeleton-item variant="h1" style="width: 10%; min-width: 150px; margin-bottom: 2rem" />
        <el-skeleton animated :rows="5"></el-skeleton>
      </template>
    </el-skeleton>
    <el-skeleton
      style="display: flex; flex-direction: column"
      v-else-if="props.type === 'form'"
      animated
    >
      <template #template>
        <el-skeleton-item
          variant="image"
          style="width: 220px; height: 220px; margin-bottom: 2rem"
        />
        <el-skeleton-item variant="rect" style="width: 220px; margin-bottom: 2rem" />
        <el-skeleton-item variant="rect" style="width: 220px; margin-bottom: 2rem" />

        <el-skeleton-item variant="button" style="width: 220px; margin-bottom: 2rem" />
      </template>
    </el-skeleton>
  </div>
</template>
<style scoped lang="scss">
.skeleton-loading {
  width: 100%;
  background-color: var(--content-bg-color);
  padding: 2rem;
}
</style>
