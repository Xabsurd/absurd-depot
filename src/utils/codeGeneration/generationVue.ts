/* eslint-disable quotes */
import type { FormRules } from 'element-plus';
import { SupportDataType, type GenerationType } from './codeGeneration';

export default class GenerationVueByElementPlus {
  constructor() {}
  generationFormByJson(json: any) {
    return `
${this.generationFormScripts(json)}
${this.generationFormTemplate(json)}
    `;
  }
  generationTableByJson(json: any) {
    const tableCode = `
<script setup lang="ts">
import { reactive, defineExpose, ref } from 'vue';
import { type FormType } from './Form.vue';
import type { ElTable } from 'element-plus';
const tableRef = ref<InstanceType<typeof ElTable>>();
const tableData = reactive<FormType[]>([]);
//detile edit delete
const emits = defineEmits<{
  (event: 'editRow', row: any): void;
  (event: 'deleteRow', row: any): void;
}>();
function handleEditRow(row: any) {
  emits('editRow', row);
}
function handleDeleteRow(row: any) {
  emits('deleteRow', row);
}
function addData(data: FormType) {
  tableData.push(data);
}
function updateData(data: FormType) {
  for (let i = 0; i < tableData.length; i++) {
    if (tableData[i].id === data.id) {
      tableData[i] = data;
    }
  }
}
function getSelectData() {
  return tableRef.value?.getSelectionRows();
}
function deleteData(rows: FormType[]) {
  //遍历rows中的每一项,删除tableData中的该项
  for (let i = 0; i < rows.length; i++) {
    tableData.splice(tableData.indexOf(rows[i]), 1);
  }
}
/**
 * 格式化日期(Y:年m:月d:日 H:时M:分S:秒)
 * @param {String} fmt 格式化样式，例如"YYYY:mm:dd HH:MM:SS"
 * @param {Date} date 被格式化的时间
 * @returns 格式化后的日期字符串
 */
function dateFormat(fmt: string, date: Date) {
  let ret;
  const opt: any = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
    }
  }
  return fmt;
}
defineExpose({ addData, getSelectData, updateData, deleteData });
</script>`;
    const tableCss = `
<style scoped>
.editor-visual {
  background-color: rgb(30, 30, 30);
  color: #dfe0e4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.75;
  margin: 1rem;
}
.editor-visual :deep(p) {
  margin: 1rem;
}
.editor-visual :deep(a) {
  color: #4099ff;
}
.editor-visual :deep(table) {
  border-collapse: collapse;
}
.editor-visual :deep(table:not([cellpadding]) td),
.editor-visual :deep(table:not([cellpadding]) th) {
  padding: 0.4rem;
}
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-width']) td),
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-width']) th) {
  border-width: 1px;
}
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-style']) td),
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-style']) th) {
  border-style: solid;
}
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-color']) td),
.editor-visual :deep(table[border]:not([border='0']):not([style*='border-color']) th) {
  border-color: #6d737b;
}
.editor-visual :deep(figure) {
  display: table;
  margin: 1rem auto;
}
.editor-visual :deep(figure figcaption) {
  color: #8a8f97;
  display: block;
  margin-top: 0.25rem;
  text-align: center;
}
.editor-visual :deep(hr) {
  border-color: #6d737b;
  border-style: solid;
  border-width: 1px 0 0 0;
}
.editor-visual :deep(code) {
  background-color: #6d737b;
  border-radius: 3px;
  padding: 0.1rem 0.2rem;
}
.editor-visual :deep(.mce-content-body:not([dir='rtl']) blockquote) {
  border-left: 2px solid #6d737b;
  margin-left: 1.5rem;
  padding-left: 1rem;
}
.editor-visual :deep(.mce-content-body[dir='rtl'] blockquote) {
  border-right: 2px solid #6d737b;
  margin-right: 1.5rem;
  padding-right: 1rem;
}
</style>
`;
    let tableTemplate = '<template>\n  <el-table :data="tableData" style="width: 100%">';
    //根据传入json的数据类型生成不的表格
    for (let i = 0; i < json.length; i++) {
      const element = json[i];
      switch (element.type) {
        case SupportDataType.text:
          tableTemplate += `
    <el-table-column prop="${element.name}" label="${element.name}">
      <template #default="scope">
        <el-popover placement="bottom" :width="1200" trigger="click">
          <div v-html="scope.row.${element.name}" class="editor-visual"></div>
          <template #reference>
            <el-button class="m-2" size="default">查看内容</el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>`;
          break;
        case SupportDataType.datetime:
        case SupportDataType.timestamp:
          tableTemplate += `\n    <el-table-column prop="${element.name}" label="${element.name}" >
          <template #default="scope">
            {{ dateFormat('YYYY-mm-dd HH:MM:SS', new Date(scope.row.${element.name})) }}
          </template>
        </el-table-column>`;
          break;
        case SupportDataType.date:
          tableTemplate += `\n    <el-table-column prop="${element.name}" label="${element.name}" >
          <template #default="scope">
            {{ dateFormat('YYYY-mm-dd', new Date(scope.row.${element.name})) }}
          </template>
        </el-table-column>`;

          break;
        case SupportDataType.time:
          tableTemplate += `\n    <el-table-column prop="${element.name}" label="${element.name}" >
          <template #default="scope">
            {{ dateFormat('HH:MM:SS', new Date(scope.row.${element.name})) }}
          </template>
        </el-table-column>`;

          break;
        default:
          tableTemplate += `\n    <el-table-column prop="${element.name}" label="${element.name}" />`;
      }
    }
    tableTemplate += `\n    <el-table-column width="auto" label="操作">
      <template #default="scope">
        <el-button @click="handleEditRow(scope.row)" size="default">修改</el-button>
        <el-button @click="handleDeleteRow(scope.row)" type="danger" size="default">删除</el-button>
      </template>
    </el-table-column>`;
    tableTemplate += '\n  </el-table>\n</template>';
    return tableCode + '\n' + tableTemplate + '\n' + tableCss;
  }
  generationTemplateByJson(json: FieldType[]) {
    const templateCode = `
<script setup lang="ts">
import Form, { type FormFunctionType, type FormType } from './Form.vue';
import Table from './Table.vue';
import { ref } from 'vue';
const formRef = ref<InstanceType<typeof Form>>();
const tableRef = ref<InstanceType<typeof Table>>();

function submitForm(data: FormType, formFunction: FormFunctionType) {
  if (formFunction === 'add') {
    tableRef.value?.addData(cloneDeep(data));
  } else if (formFunction === 'edit') {
    tableRef.value?.updateData(cloneDeep(data));
  }
}
function handleEdit(row: FormType) {
  formRef.value?.openForm('edit', cloneDeep(row));
}
function handleDelete(row: FormType) {
  tableRef.value?.deleteData([row]);
}
function handleBatchDeleteRow() {
  const selectData = tableRef.value?.getSelectData();
  tableRef.value?.deleteData(selectData);
}
function handleAdd() {
  formRef.value?.openForm('add');
}
//深拷贝，在实际应用中请按需更改为api数据
function cloneDeep(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
</script>
<template>
  <div>
    <el-button @click="handleAdd">添加</el-button>
    <el-button @click="handleBatchDeleteRow()">批量删除</el-button>
    <Form @submit="submitForm" ref="formRef"></Form>
    <Table @edit-row="handleEdit" @delete-row="handleDelete" ref="tableRef"></Table>
  </div>
</template>
<style scoped></style>
    
    `;
    const tableCode = this.generationTableByJson(json);
    const formCode = this.generationFormByJson(json);
    return {
      template: templateCode,
      table: tableCode,
      form: formCode
    };
  }
  generationFormTemplate(json: FieldType[]) {
    let formCode =
      '<template>\n  <el-dialog title="添加" v-model="dialogVisible" width="80%" min-width="500px">\n    <el-form :model="formData" label-width="auto" ref="formRef" :rules="formRules">';
    //根据传入json的数据类型生成不同的表单
    for (let i = 0; i < json.length; i++) {
      const element = json[i];
      formCode += `\n      <el-form-item label="${element.name}" prop="${element.name}">`;
      //判断element的类型
      switch (element.type) {
        case SupportDataType.varchar:
          formCode += `<el-input v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.text:
          formCode += `<Editor v-model="formData.${element.name}" ref="${element.name}EditorRef"></Editor>`;
          break;
        case SupportDataType.char:
          formCode += `<el-input v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.integer:
          formCode += `<el-input-number v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.datetime:
          formCode += `<el-date-picker type="datetime" v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.float:
          formCode += `<el-input-number v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.double:
          formCode += `<el-input-number v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.boolean:
          formCode += `<el-switch v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.date:
          formCode += `<el-date-picker v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.time:
          formCode += `<el-time-picker  v-model="formData.${element.name}" />`;
          break;
        case SupportDataType.timestamp:
          formCode += `<el-date-picker type="datetime"  v-model="formData.${element.name}" />`;
          break;
        default:
          break;
      }
      formCode += '</el-form-item>';
    }
    formCode += `
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>`;
    return formCode;
  }
  generationFormScripts(json: FieldType[]) {
    const formTypeCode: string[] = [];
    const formDataCode: string[] = [];
    const formSetCode: string[] = [];
    const editorRefCode: string[] = [];
    const editorContentCode: string[] = [];
    const formRulesCode: string[] = [];
    for (let i = 0; i < json.length; i++) {
      const element = json[i];
      formTypeCode.push(`${element.name}: ${this.dataStructureType2JS(element.type)}`);
      formDataCode.push(`${element.name}: ${this.generationDefaultValue(element.type)}`);
      formSetCode.push(`formData.${element.name} = data.${element.name}`);
      if (element.type === SupportDataType.text) {
        editorRefCode.push(`const ${element.name}EditorRef = ref<InstanceType<typeof Editor>>();`);
        editorContentCode.push(`${element.name}EditorRef.value?.setContent(data.${element.name});`);
      }
      if (!element.canNull) {
        formRulesCode.push(
          `${element.name}: [{ required: true, message: '请输入${element.name}', trigger: 'blur' }${element.size > 0 ? `,{ min: 1, max: ${element.size}, message: 'Length should be 1 to ${element.size}', trigger: 'blur' }` : ``}]`
        );
      }
    }
    const typeCode = `
export type FormFunctionType = 'add' | 'edit';
export type FormType = {
  ${formTypeCode.join(',\n  ')}
};`;
    const variantCode = `
const emits = defineEmits<{
  (event: 'submit', fieldList: FormType, type: FormFunctionType): void;
}>();
let formFunction:FormFunctionType = 'add';
const dialogVisible = ref(false);
${editorRefCode.join('\n')}
const formRef = ref<FormInstance>();
const formData = reactive<FormType>({
  ${formDataCode.join(',\n  ')}
});
const formRules = reactive<FormRules<FormType>>({
  ${formRulesCode.join(',\n  ')}
});`;
    const importCode = `
import { reactive, ref, toRaw } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import Editor from './Editor.vue';`;
    const functionCode = `
function submitForm() {
  if (!formRef.value) return;
  formRef.value.validate((valid) => {
    if (valid) {
      if (formFunction === 'add') {
        formData.id = getUID();
      }
      emits('submit', toRaw(formData), formFunction);
      resetForm();
      dialogVisible.value = false;
    }
  });
}
function resetForm() {
  if (!formRef.value) return;
  formRef.value.resetFields();
  formRef.value.clearValidate();
  // 清空富文本编辑器内容
  ${editorContentCode.join('\n').replaceAll(/\(.*?\)/g, "('')")}
}
function setFormData(data: FormType) {
  ${formSetCode.join('\n  ')}
  ${editorContentCode.join('\n  ')}
}
//生成简易的唯一ID，你可以自己替换成其他的
function getUID() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2) +
    Math.random().toString(36).substr(2)
  );
}
function openForm(type: FormFunctionType, data?: FormType) {
  formFunction = type;
  dialogVisible.value = true;
  if (data) {
    setFormData(data);
  }
}
defineExpose({ openForm });`;
    return (
      '<script setup lang="ts">' + typeCode + variantCode + importCode + functionCode + '</script>'
    );
  }
  generationDefaultValue(field: SupportDataType) {
    switch (field) {
      case SupportDataType.varchar:
      case SupportDataType.text:
        return "''";
      case SupportDataType.integer:
        return 0;
      case SupportDataType.datetime:
        return 'new Date()';
      case SupportDataType.float:
      case SupportDataType.double:
        return 0.0;
      case SupportDataType.boolean:
        return false;
      case SupportDataType.char:
        return "''";
      case SupportDataType.timestamp:
        return 'new Date()';
      case SupportDataType.date:
        return 'new Date()';
      case SupportDataType.time:
        return 'new Date()';
      default:
        return "''";
    }
  }
  dataStructureType2JS(type: SupportDataType) {
    switch (type) {
      case SupportDataType.varchar:
      case SupportDataType.text:
        return 'string';
      case SupportDataType.integer:
        return 'number';
      case SupportDataType.datetime:
        return 'Date';
      case SupportDataType.float:
      case SupportDataType.double:
        return 'number';
      case SupportDataType.boolean:
        return 'boolean';
      case SupportDataType.char:
        return 'string';
      case SupportDataType.timestamp:
        return 'Date';
      case SupportDataType.date:
        return 'Date';
      case SupportDataType.time:
        return 'Date';
      default:
        return 'string';
    }
  }
}
