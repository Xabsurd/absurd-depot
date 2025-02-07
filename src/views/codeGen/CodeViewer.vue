<script setup lang="ts">
import { Repl, useStore, useVueImportMap } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { headerCode, vueCode, config, ComponentCode } from './defaultCode';
import { nextTick, onMounted } from 'vue';
const emits = defineEmits(['loaded']);
defineExpose({ changeCode });
const {
  importMap: builtinImportMap,
  vueVersion,
  productionMode
} = useVueImportMap({
  // runtimeDev: 'cdn link to vue.runtime.esm-browser.js',
  // runtimeProd: 'cdn link to vue.runtime.esm-browser.prod.js',
  // serverRenderer: 'cdn link to server-renderer.esm-browser.js'
});
const store = useStore({ builtinImportMap, vueVersion });
// vueVersion.value = '3.4.21';
productionMode.value = true;

const previewOptions = {
  headHTML:
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-plus@2.6/dist/index.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-plus@2.6/theme-chalk/dark/css-vars.css">` +
    headerCode.tinymce,
  customCode: {
    importCode:
      'import ElementPlus from "https://cdn.jsdelivr.net/npm/element-plus@2.6/dist/index.full.mjs";',
    useCode: 'app.use(ElementPlus, { size: "large" });'
  }
};
// let code: { template: string; table: string; form: string };
function changeCode(code: { template: string; table: string; form: string }) {
  store.setFiles({
    'App.vue': vueCode,
    'Index.vue': code.template,
    'Table.vue': code.table,
    'Form.vue': code.form,
    'Editor.vue': ComponentCode.editor,
    'tsconfig.json': config,
  });
  // const file = new File('Editor.vue', ComponentCode.editor);
  // store.addFile(file);
}
onMounted(() => {
  nextTick(() => {
    emits('loaded');
  });
});
</script>
<template>
  <Repl
    :editor="Monaco"
    :theme="'dark'"
    :store="store"
    :clear-console="false"
    :previewOptions="previewOptions"
    :previewTheme="true"
  />
</template>
<style scoped></style>
