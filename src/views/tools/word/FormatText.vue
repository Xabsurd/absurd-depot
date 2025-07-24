<template>
  <div class="format-text-container">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧输入区域 -->
      <el-col :span="12" style="height: 100%;">
        <el-card class="input-card" style="height: 100%;display:flex; flex-direction: column;" body-style="flex: 1;">
          <template #header>
            <div class="card-header">
              <span>输入区域</span>
              <el-button size="small" @click="clearInput">清空</el-button>
            </div>
          </template>
          <el-input
            v-model="inputText"
            type="textarea"
            placeholder="支持三种格式：&#10;1. white hair: 白发&#10;2. goggles (护目镜)&#10;3. white hair - 白发"
            :rows="20"
            resize="none"
            class="input-textarea"
          />
        </el-card>
      </el-col>

      <!-- 右侧输出区域 -->
      <el-col :span="12" style="height: 100%;">
        <el-card class="output-card" style="height: 100%;display:flex; flex-direction: column;" body-style="flex: 1;">
          <template #header>
            <div class="card-header">
              <span>输出区域</span>
              <el-button size="small" @click="copyOutput" :disabled="!outputText">复制</el-button>
            </div>
          </template>
          <div class="output-container">
            <div class="output-section">
              <el-divider content-position="left">英文</el-divider>
              <el-input
                v-model="englishOutput"
                type="textarea"
                readonly
                :rows="8"
                resize="none"
                class="output-textarea"
              />
            </div>
            <div class="output-section">
              <el-divider content-position="left">中文</el-divider>
              <el-input
                v-model="chineseOutput"
                type="textarea"
                readonly
                :rows="8"
                resize="none"
                class="output-textarea"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

const inputText = ref('');
const englishOutput = ref('');
const chineseOutput = ref('');

// 计算输出文本
const outputText = computed(() => {
  return englishOutput.value + '\n' + chineseOutput.value;
});

// 解析输入文本并转换格式
function parseAndFormat(text: string) {
  if (!text.trim()) {
    englishOutput.value = '';
    chineseOutput.value = '';
    return;
  }

  const lines = text.split('\n').filter(line => line.trim());
  const englishTerms: string[] = [];
  const chineseTerms: string[] = [];

  lines.forEach(line => {
    // 匹配 "english: chinese" 格式
    let match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      const english = match[1].trim();
      const chinese = match[2].trim();
      englishTerms.push(english);
      chineseTerms.push(chinese);
      return;
    }

    // 匹配 "english (chinese)" 格式
    match = line.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      const english = match[1].trim();
      const chinese = match[2].trim();
      englishTerms.push(english);
      chineseTerms.push(chinese);
      return;
    }
    //匹配 "english - chinese" 格式
    match = line.match(/^(.+?)\s*-\s*(.+)$/);
    if (match) {
      const english = match[1].trim();
      const chinese = match[2].trim();
      englishTerms.push(english);
      chineseTerms.push(chinese);
      return;
    }
  });

  englishOutput.value = englishTerms.join(',');
  chineseOutput.value = chineseTerms.join(',');
}

// 监听输入文本变化
watch(inputText, (newValue) => {
  parseAndFormat(newValue);
}, { immediate: true });

// 清空输入
function clearInput() {
  inputText.value = '';
}

// 复制输出
async function copyOutput() {
  if (!outputText.value.trim()) {
    ElMessage.warning('没有内容可复制');
    return;
  }

  try {
    await navigator.clipboard.writeText(outputText.value);
    ElMessage.success('复制成功');
  } catch {
    ElMessage.error('复制失败');
  }
}
</script>

<style scoped lang="scss">
.format-text-container{
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.25rem;
  box-sizing: border-box;
}
.input-textarea{
  height: 100%;
  resize: none;
  :deep(.el-textarea__inner) {
    height: 100%;
    font-size: 14px;
    line-height: 1.5;
  }
}
</style>
