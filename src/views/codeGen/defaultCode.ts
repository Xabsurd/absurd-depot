export const vueCode = `
<script setup lang="ts">
import Index from './Index.vue';
</script>
<template>
  <Index></Index>
</template>
<style scoped>
</style>
`;
export const vueCode1 = `
<script setup lang="ts">
</script>
<template>
  <el-button>我是 ElButton1</el-button>
</template>
<style scoped>
</style>
`;
export const mainCode = `
import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
const app = createApp(App);
app.use(ElementPlus, { size: 'large' });
app.mount('#app');
`;
export const mainCode1 = `
import { createApp } from 'vue';
import App from './App1.vue';
import ElementPlus from 'element-plus';
const app = createApp(App);
app.use(ElementPlus, { size: 'large' });
app.mount('#app');
`;
export const config = `
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "jsx": "Preserve",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true
  },
  "vueCompilerOptions": {
    "target": 3.4
  }
}
`;
export const importMap = `
{
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/@vue/runtime-dom@3.4.21/dist/runtime-dom.esm-browser.js",
      "vue/server-renderer": "https://cdn.jsdelivr.net/npm/@vue/server-renderer@3.4.21/dist/server-renderer.esm-browser.js",
      "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@4.0.12/dist/vue-router.esm-browser.js",
      "element-plus": "https://cdn.jsdelivr.net/npm/element-plus@2.6/dist/index.full.mjs"
    },
    "scopes": {}
  }
  `;
export const headerCode = {
  tinymce: '<script src="/node_modules/tinymce/tinymce.min.js"></script>'
};
export const ComponentCode = {
  editor: `
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Editor, RawEditorOptions } from 'tinymce';
const tinymceContainerRef = ref<HTMLTextAreaElement>();
const model = defineModel<string>();
const options: RawEditorOptions = {
  height: 500,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'help',
    'quickbars',
    'wordcount',
    'code',
    'codesample',
  ],
  toolbar:
    'undo redo | blocks fontsize | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'table| codesample code|removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif;}',
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  skin: 'vscode-dark',
  content_css: 'vscode-dark'
};
let tinymce: Editor[];
onMounted(() => {
  const tinymce_script = document.getElementById('tinymce-script');
  if (!tinymce_script) {
    const dom = document.createElement('script');
    dom.setAttribute('id', 'tinymce-script');
    dom.setAttribute('src', '/node_modules/tinymce/tinymce.min.js');
    document.body.appendChild(dom);
    console.log(tinymceContainerRef.value);
    dom.onload = async () => {
      initEditor();
    };
  } else {
    initEditor();
  }
});
async function initEditor() {
  options.target = tinymceContainerRef.value;
  tinymce = await window.tinymce.init(options);
  tinymce[0]
    .on('input', () => {
      model.value = tinymce[0].getContent();
    })
    .on('change', () => {
      model.value = tinymce[0].getContent();
    });
}
function setContent(content: string) {
  tinymce[0].setContent(content);
}
defineExpose({ setContent });
</script>
<template>
  <div class="Editor" ref="EditorRef">
    <textarea ref="tinymceContainerRef" v-model="model"></textarea>
  </div>
</template>
<style scoped>
.Editor {
  width: 100%;
}
:deep(.tox-promotion) {
  display: none;
}
</style>

`
};
