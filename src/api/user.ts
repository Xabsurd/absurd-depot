import { type MenuMap } from '@/router';
/**
 * 模拟从后端获取用户菜单
 * @returns {Promise<MenuMap[]>}菜单列表
 */
export async function getUserMenuMap(): Promise<MenuMap[]> {
  return await new Promise(async (resolve) => {
    const menuMap = await import('@/router/menuMap.json');
    setTimeout(() => {
      resolve(menuMap.default as unknown as MenuMap[]);
    }, 1000);
  });
}
