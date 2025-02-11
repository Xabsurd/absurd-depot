<template>
  <div class="iconSelector"></div>
</template>
<script setup lang="ts">
const icons = import.meta.glob('/node_modules/@iconify-icons/mingcute/*.js');
console.log(icons);
</script>
<style lang="scss" scoped>
.iconSelector {
}
</style>
