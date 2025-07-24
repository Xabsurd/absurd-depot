<template>
  <el-row :gutter="20" class="color-selection" style="height: 100%; margin: 0; overflow: hidden;">
    <!-- 左侧：点位颜色信息列表 -->
    <el-col :span="8" style="height: 100%; overflow-y: auto;">
      <el-card>
        <h3>点位颜色信息</h3>
        <VueDraggable v-model="points" :animation="200" group="points">
          <el-card
            v-for="(point, index) in points"
            :key="point.id"
            class="point-card"
            style="margin-bottom: 10px; display: flex; align-items: center;"
          >
            <div
              class="color-circle"
              :style="{ backgroundColor: point.color }"
            ></div>
            <div style="flex: 1; margin-left: 10px;">
              <p>点位 {{ index + 1 }}</p>
              <p>颜色: {{ point.color }}</p>
              <p>与上点差值: {{ point.diff }}</p>
            </div>
            <el-button type="danger" size="small" @click="removePoint(index)">删除</el-button>
          </el-card>
        </VueDraggable>
      </el-card>
    </el-col>

    <!-- 右侧：图片区域 -->
    <el-col :span="16" style="position: relative; height: 100%; overflow: hidden;">
      <UploadFile
        class="upload"
        :accept="'image/*'"
        :show-placeholder="!imageUrl"
        :disable-click="!!imageUrl"
        @upload="handleUpload"
      >
        <template #placeholder>
          <div class="placeholder" style="border: 2px dashed #ccc; padding: 20px; text-align: center;">
            <p><DynamicIcon icon="mingcute:upload-2-fill"></DynamicIcon></p>
            <p>点击或拖入图片上传</p>
          </div>
        </template>
        <template v-if="imageUrl">
          <ImageCanvas
            :image-url="imageUrl"
            :points="points"
            @update-points="updatePoints"
          />
        </template>
      </UploadFile>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { VueDraggable } from 'vue-draggable-plus';
import UploadFile from '@/components/files/UploadFile.vue';
import ImageCanvas from '@/components/image/ImageCanvas.vue';

type Point = {
  id: number;
  x: number;
  y: number;
  color: string;
  diff: string;
};

const imageUrl = ref<string | null>(null);
const points = ref<Point[]>([]);

// 上传图片
function handleUpload(files: FileList | null) {
  if (!files || files.length === 0) {
    ElMessage.error('请上传图片文件');
    return;
  }
  const file = files[0];
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件');
    return;
  }
  imageUrl.value = URL.createObjectURL(file);
  points.value = []; // 清空点位
}

// 更新点位信息
function updatePoints(newPoints: Point[]) {
  points.value = newPoints;
}

// 删除点
function removePoint(index: number) {
  points.value.splice(index, 1);
}
</script>

<style scoped>
.color-selection {
  height: 100%;
}
.point-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}
.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
