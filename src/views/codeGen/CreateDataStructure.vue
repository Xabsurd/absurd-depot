<script setup lang="ts">
//弹出框，创建数据结构
import type { MessageSchema } from '@/types/schema';
import { SupportDataType } from '@/utils/codeGeneration/codeGeneration';
import { UniqueValidateResult, isUniqueKeyAndNotNull } from '@/utils/dataTools';
import { ElMessage, type FormInstance } from 'element-plus';
import { reactive, defineExpose, defineEmits, ref, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
const emits = defineEmits<{
  (event: 'submit', fieldList: DataStructureType, type: OperationType): void;
}>();

defineExpose({ open, close });
export type OperationType = 'create' | 'edit' | 'view';
//弹出框，分配功能类型
const _type = ref<OperationType>('create');
const formRef = ref<FormInstance>();
const { t } = useI18n<{ message: MessageSchema }>();
const defaultField: () => FieldType = () => {
  return {
    name: '',
    type: 'integer' as SupportDataType.integer,
    size: 0,
    description: '',
    canNull: false
  };
};
const formData = reactive<DataStructureType>({
  name: '',
  alias: '',
  description: '',
  dataStructure: [defaultField()],
  addTime: new Date()
});

const state = reactive({
  listVisible: false,
  formVisible: false
});
function addFieldItem() {
  formData.dataStructure.push(defaultField());
}
function removeFieldItem(index: number) {
  if (formData.dataStructure.length > 1) {
    formData.dataStructure.splice(index, 1);
  }
}
function submitList() {
  if (_type.value === 'view') {
    close();
    return;
  }
  const result = isUniqueKeyAndNotNull(formData.dataStructure, 'name');
  switch (result) {
    case UniqueValidateResult.Unique:
      state.formVisible = true;
      break;
    case UniqueValidateResult.Null:
      ElMessage.error(t('component.codeGen.createDataStructure.error1'));
      break;
    case UniqueValidateResult.Duplicate:
      ElMessage.error(t('component.codeGen.createDataStructure.error2'));
  }
}
function submitForm() {
  if (!formRef.value) return;
  formRef.value.validate((valid) => {
    if (valid) {
      formData.addTime = new Date();
      emits('submit', formData, _type.value);
      state.formVisible = false;
      close();
    }
  });
}
function open(type: OperationType, item?: DataStructureType) {
  state.listVisible = true;
  _type.value = type;
  console.log(_type);
  switch (type) {
    case 'create':
      formData.dataStructure = [defaultField()];
      formData.name = '';
      formData.description = '';
      break;
    case 'edit':
      if (item) {
        formData.id = item.id;
        formData.dataStructure = item.dataStructure;
        formData.name = item.name;
        formData.description = item.description;
      }
      break;
    case 'view':
      if (item) {
        formData.dataStructure = item.dataStructure;
        formData.name = item.name;
        formData.description = item.description;
      }
      break;
  }
}
function close() {
  state.listVisible = false;
  state.formVisible = false;
}
</script>
<template>
  <el-dialog :title="t('component.codeGen.createDataStructure.save')" v-model="state.formVisible">
    <el-form :model="formData" class="demo-form-inline" ref="formRef" label-width="auto">
      <el-form-item
        :label="t('component.tableField.name')"
        prop="name"
        :rules="[{ required: true, message: 'name is required' }]"
      >
        <el-input v-model="formData.name" :placeholder="t('component.tableField.name')" clearable />
      </el-form-item>
      <el-form-item :label="t('component.tableField.description')" prop="description">
        <el-input
          v-model="formData.description"
          :placeholder="t('component.tableField.description')"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="state.formVisible = false">{{ t('operation.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm()">
          {{ t('operation.confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    :title="t('component.codeGen.createDataStructure.title_' + _type)"
    v-model="state.listVisible"
    width="80%"
    :class="_type + 'DataStructure'"
  >
    <el-table :data="formData.dataStructure">
      <el-table-column property="name" :label="t('component.tableField.name')" width="180">
        <template #default="scope">
          <el-input v-model="scope.row.name" v-if="_type !== 'view'"></el-input>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column property="alias" :label="t('component.tableField.alias')" width="180">
        <template #default="scope">
          <el-input v-model="scope.row.alias" v-if="_type !== 'view'"></el-input>
          <span v-else>{{ scope.row.alias }}</span>
        </template>
      </el-table-column>
      <el-table-column property="type" :label="t('component.tableField.type')" width="180">
        <template #default="scope">
          <el-select v-model="scope.row.type" v-if="_type !== 'view'">
            <el-option
              v-for="(item, key) in SupportDataType"
              :key="key"
              :label="key"
              :value="key"
            ></el-option>
          </el-select>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column property="size" :label="t('component.tableField.size')" width="185">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.size"
            style="width: 150px"
            v-if="_type !== 'view'"
          ></el-input-number>
          <span v-else>{{ scope.row.size }}</span>
        </template>
      </el-table-column>
      <el-table-column property="description" :label="t('component.tableField.description')">
        <template #default="scope">
          <el-input v-model="scope.row.description" v-if="_type !== 'view'"></el-input>
          <span v-else>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column
        property="canNull"
        :label="t('component.tableField.canNull')"
        width="120"
        align="center"
      >
        <template #default="scope">
          <el-checkbox v-model="scope.row.canNull" :disabled="_type === 'view'"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column width="55" align="center" size="small" v-if="_type !== 'view'">
        <template #default="scope">
          <el-tooltip :content="t('operation.delete')" placement="top">
            <el-button @click="removeFieldItem(scope.$index)" link type="danger">
              <DynamicIcon :icon="'mingcute:close-fill'"></DynamicIcon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="add-field" @click="addFieldItem" v-if="_type !== 'view'">
      <dynamic-icon :icon="'mingcute:add-fill'"></dynamic-icon>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">{{ t('operation.cancel') }}</el-button>
        <el-button type="primary" @click="submitList">
          {{ t('operation.confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.add-field {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
  width: 100%;
  border: 1px dashed var(--el-border-color);
  transition: all 0.3s;
  i {
    font-size: 1.5rem;
  }
  &:hover {
    cursor: pointer;
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}
.el-table {
  :deep(.el-table__inner-wrapper::before) {
    display: none !important;
  }
  :deep(.el-table__body-wrapper) {
    tr:nth-last-child(1) {
      td.el-table__cell {
        border: none;
      }
    }
  }
}
</style>
