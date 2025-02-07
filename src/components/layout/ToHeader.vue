<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue';

const to = ref('');
onMounted(() => {
  nextTick(() => {
    to.value = '#header';
  });
});
</script>
<template>
  <Teleport :to="to" v-if="to">
    <div class="header-module">
      <div class="filler"></div>
      <slot></slot>
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.header-module {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 10px;
  .filler{
    flex:1;
  }
}
</style>
