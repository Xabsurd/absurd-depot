import menuMap, { type MenuMap } from '@/router/menuMap';
/**
 * 模拟从后端获取用户菜单
 * @returns {Promise<MenuMap[]>}菜单列表
 */
export async function getUserMenuMap(): Promise<MenuMap[]> {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(menuMap);
    }, 0);
  });
}
