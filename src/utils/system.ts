/**
 * 获取系统主题
 * @returns {string} 主题
 */
export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
/**
 * 获取系统语言
 * @returns {string} 语言
 */
export function getSystemLanguage() {
  return window.navigator.language;
}
