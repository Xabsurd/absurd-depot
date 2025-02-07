<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
const state = reactive({});
const viewer = inject('viewer');
console.log(viewer);
</script>
<template><div>Start.vue</div></template>
<style scoped lang="scss"></style>
