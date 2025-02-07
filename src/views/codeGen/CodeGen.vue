<script setup lang="ts">
import { reactive, ref } from 'vue';
import DataStructure from './DataStructure.vue';
// import { type CodeViewer } from './CodeViewer.vue';
import CodeGeneration, { GenerationType } from '@/utils/codeGeneration/codeGeneration';
import { defineAsyncComponent } from 'vue';
//此组件过大，需要异步加载
const CodeViewer = defineAsyncComponent(() => import('./CodeViewer.vue'));
const CodeViewerRef = ref<InstanceType<typeof CodeViewer>>();
const state = reactive({
  codeViewerVisible: false
});
const codeGeneration = new CodeGeneration();
let code:
  | {
      template: string;
      table: string;
      form: string;
    }
  | undefined;
function handleGenerateCode(fieldList: FieldType[]) {
  //存储生成的代码，以在组件加载完成时直接打开预览
  code = codeGeneration.generationTemplateByJson(fieldList, GenerationType.vue);
  state.codeViewerVisible = true;
}
function handleCodeViewerLoaded() {
  //动态加载组件需要在组件安装完毕后才能调用函数
  if (code) {
    CodeViewerRef.value?.changeCode(code);
  }
}
</script>
<template>
  <div id="CodeGen">
    <CodeViewer
      v-if="state.codeViewerVisible"
      ref="CodeViewerRef"
      @loaded="handleCodeViewerLoaded"
    ></CodeViewer>
    <DataStructure v-show="!state.codeViewerVisible" @generate="handleGenerateCode"></DataStructure>
    <el-tooltip content="关闭代码预览" placement="top" v-if="state.codeViewerVisible">
      <DynamicIcon
        class="close-CodeViewer"
        :icon="'mingcute:close-fill'"
        @click="state.codeViewerVisible = false"
      ></DynamicIcon>
    </el-tooltip>
  </div>
</template>
<style scoped lang="scss">
#CodeGen {
  width: 100%;
  height: 100%;
  .close-CodeViewer {
    width: 2rem;
    height: 2rem;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.5rem;
    color: var(--el-color-primary);
    &:hover {
      color: var(--el-color-primary-light-3);
    }
  }
}
</style>
