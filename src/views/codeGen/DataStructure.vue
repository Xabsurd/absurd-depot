<script setup lang="ts">
import { reactive, ref, defineProps, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MessageSchema } from '@/types/schema';
import CreateDataStructure, { type OperationType } from './CreateDataStructure.vue';
import apiEngine from '@/api/apiEngine';
import { ElMessage } from 'element-plus';
const { t } = useI18n<{ message: MessageSchema }>();
const CreateDataStructureRef = ref<InstanceType<typeof CreateDataStructure>>();
const emits = defineEmits<{
  (event: 'generate', fieldList: FieldType[]): void;
}>();
const tableData = ref<DataStructureType[]>();
updateTableData();
function updateTableData() {
  apiEngine.codeGen.dataStructure.getAll().then((res) => {
    tableData.value = res;
  });
}
function handleEditRow(index: number, row: any) {
  CreateDataStructureRef.value?.open('edit', row);
}
function handleAddRow() {
  CreateDataStructureRef.value?.open('create');
}
async function handleVisualRow(index: number, row: any) {
  CreateDataStructureRef.value?.open('view', row);
}
function handleDeleteRow(index: number, row: any) {}
function handleBatchDeleteRow(index: number, row: any) {}
async function handleCreateSubmit(row: DataStructureType, type: OperationType) {
  switch (type) {
    case 'create':
      if (await apiEngine.codeGen.dataStructure.haveName(row.id ? row.id : -1, row.name)) {
        ElMessage.error('Data Structure Name Already Exists!');
        return;
      }
      apiEngine.codeGen.dataStructure.add(toRaw(row)).then((res) => {});
      updateTableData();
      break;
    case 'edit':
      if (await apiEngine.codeGen.dataStructure.haveName(row.id ? row.id : -1, row.name)) {
        ElMessage.error('Data Structure Name Already Exists!');
        return;
      }
      apiEngine.codeGen.dataStructure.update(toRaw(row)).then((res) => {});
      updateTableData();
      break;
    case 'view':
      break;
  }
}
function handleGenerateCode(row: DataStructureType) {
  emits('generate', toRaw(row.dataStructure));
}
</script>
<template>
  <div id="DataStructure">
    <CreateDataStructure
      ref="CreateDataStructureRef"
      @submit="handleCreateSubmit"
    ></CreateDataStructure>
    <div class="toolbar">
      <el-button type="primary" @click="handleAddRow()" style="margin-right: 10px">
        {{ t('operation.create') }}
      </el-button>
      <el-button
        type="danger"
        @click="handleBatchDeleteRow(0, {})"
        style="margin-right: 10px"
        size="large"
      >
        {{ t('operation.batchDelete') }}
      </el-button>
    </div>
    <div class="structure-visual">
      <el-table
        :data="tableData"
        border
        style="width: 100%; height: calc(100vh - var(--toolbar-height) - var(--header-height))"
        size="large"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" :label="t('label.name')" width="180" />
        <el-table-column prop="addTime" width="180" :label="t('label.addTime')">
          <template #default="scope">
            {{ new Date(scope.row.addTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="t('label.description')"
          :show-overflow-tooltip="true"
        />
        <el-table-column width="auto" :label="t('label.operation')">
          <template #default="scope">
            <el-button @click="handleGenerateCode(scope.row)" size="default" type="primary">
              {{ t('component.codeGen.title') }}
            </el-button>
            <el-button @click="handleVisualRow(scope.$index, scope.row)" size="default">
              {{ t('operation.detil') }}
            </el-button>
            <el-button @click="handleEditRow(scope.$index, scope.row)" size="default">
              {{ t('operation.edit') }}
            </el-button>

            <el-button type="danger" size="default">{{ t('operation.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
#DataStructure {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .toolbar {
    height: var(--header-height);
    display: flex;
    align-items: center;
    padding-left: 10px;
  }
}
</style>
