import { nextTick, type WritableComputedRef } from 'vue';
import { createI18n, type I18n } from 'vue-i18n';
export function setupI18n(options = { locale: 'zh' }) {
  const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: options.locale, // set locale
    fallbackLocale: 'en', // set fallback locale
    missingWarn: false,
    silentTranslationWarn: false,
    silentFallbackWarn: false,
    fallbackWarn: false
  });
  setI18nLanguage(i18n, options.locale);
  return i18n;
}

export function setI18nLanguage(i18n: I18n, locale: string) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    (i18n.global.locale as WritableComputedRef<string>).value = locale;
  }
  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  document.querySelector('html')?.setAttribute('lang', locale);
}

export async function loadLocaleMessages(i18n: I18n, locale: string) {
  // load locale messages with dynamic import
  const messages = await import(`../locales/${locale}.json`);
  console.log(messages);
  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default);

  return nextTick();
}
