import { defineStore } from 'pinia';
import { getItem, setItem } from '../utils/localStorage';
import { setupI18n, setI18nLanguage, loadLocaleMessages } from '@/locales/i18n';
import { getSystemLanguage, getSystemTheme } from '@/utils/system';
import { SUPPORT_LOCALES, SUPPORT_THEMES } from '../utils/config';
import { useDark, useToggle } from '@vueuse/core';

export const isDark = useDark();
export const toggleDark = useToggle(isDark);

let setting = getItem('setting');
if (!setting) {
  setting = { language: 'systemSetting', theme: 'systemSetting' };
  setItem({
    name: 'setting',
    value: setting
  });
}
if (!SUPPORT_LOCALES.includes(setting.language)) {
  setting.language = 'zh-CN';
}
export const i18n = setupI18n({ locale: setting.language });
async function initI18n() {
  await loadLocaleMessages(i18n, setting.language);
  setI18nLanguage(i18n, setting.language);
}
initI18n();
export const useSettingStore = defineStore('SettingStore', {
  state() {
    return {
      language: setting.language,
      theme: setting.theme,
      appliedTheme: '',
      menuCollapse: false,
      fullScreen: 0 //0正常|1网页全屏|2全屏内容|3全屏网页
    };
  },
  getters: {},
  actions: {
    async changeLanguage(lang: string) {
      this.language = lang;
      setting.language = lang;
      if (lang === 'systemSetting' && !SUPPORT_LOCALES.includes(getSystemLanguage())) {
        lang = 'zh-CN';
      }
      if (!i18n.global.availableLocales.includes(lang)) {
        await loadLocaleMessages(i18n, lang);
      }
      if (SUPPORT_LOCALES.includes(this.language)) {
        setItem({
          name: 'setting',
          value: setting
        });
        setI18nLanguage(i18n, lang);
      }
    },
    changeTheme(theme: string) {
      // toggleDark();
      this.theme = theme;
      setting.theme = theme;
      if (theme === 'systemSetting') {
        theme = getSystemTheme();
      }
      if (SUPPORT_THEMES.includes(theme)) {
        setItem({
          name: 'setting',
          value: setting
        });
        //删除所有主题class
        for (let i = 0; i < SUPPORT_THEMES.length; i++) {
          const element = SUPPORT_THEMES[i];
          document.querySelector('html')?.classList.remove(element);
        }
        document.querySelector('html')?.classList.add(theme);
        this.appliedTheme = theme;
      }
    }
  }
});
