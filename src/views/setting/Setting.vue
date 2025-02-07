<template>
  <el-form label-width="100px" :model="state.setting">
    <el-form-item :label="t('label.language')">
      <el-select
        v-model="state.setting.language"
        :placeholder="t('label.language')"
        @change="languageChange"
      >
        <el-option
          v-for="item in state.languageOptions"
          :key="item"
          :label="item === 'systemSetting' ? t('label.systemSetting') : getLanguageWords(item)"
          :value="item"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="t('label.theme')">
      <el-select
        v-model="state.setting.theme"
        :placeholder="t('label.theme')"
        @change="themeChange"
      >
        <el-option
          v-for="item in state.themeOptions"
          :key="item"
          :label="t('label.' + item)"
          :value="item"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { useSettingStore } from '@/stores/setting';
import type { MessageSchema } from '@/types/schema';
import { useI18n } from 'vue-i18n';
import { SUPPORT_LOCALES, SUPPORT_THEMES, LANGUAGE_WORDS } from '@/utils/config';
const { t } = useI18n<{ message: MessageSchema }>();
const settingStore = useSettingStore();
const state = reactive({
  setting: {
    language: settingStore.language,
    theme: settingStore.theme
  },
  languageOptions: ['systemSetting', ...SUPPORT_LOCALES],
  themeOptions: ['systemSetting', ...SUPPORT_THEMES]
});
function languageChange(value: string) {
  settingStore.changeLanguage(value);
}
function themeChange(value: string) {
  settingStore.changeTheme(value);
}
function getLanguageWords(key: string) {
  return LANGUAGE_WORDS[key];
}
onMounted(() => {});
</script>

<style lang="scss" scoped>
.el-form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;

  overflow: auto;
  .el-form-item:last-child {
    margin-bottom: 0;
  }
  .el-select {
    width: 220px;
  }
}
</style>
