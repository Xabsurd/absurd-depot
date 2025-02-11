import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { getUserMenuMap } from '@/api/user';
import { getItem, setItem } from '@/utils/localStorage';
export type MenuMap = {
  icon?: string;
} & RouteRecordRaw;
const AllRouter = import.meta.glob([
  '@/views/**/*.vue',
  '!**/layout/**/*.vue',
  '!**/components/**/*.vue'
]);
function setRouter(data: Array<MenuMap>): RouteRecordRaw[] {
  const arr: RouteRecordRaw[] = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    if (element.component) {
      element.component = AllRouter[`${element.component}`];
    }
    arr.push(element);
    if (element.children) {
      arr[arr.length - 1].children = setRouter(element.children);
    }
  }
  return arr;
}
// console.log(routerMap);
const routes = [
  {
    path: '/',
    name: 'base',
    component: () => import('../views/layout/Layout.vue'),
    children: [
      ...[
        { path: '/:pathMatch(.*)', component: () => import('../views/error/404.vue') },
        { path: '/404', component: () => import('../views/error/404.vue') }
      ]
    ]
  }
];

const router = createRouter({
  // history: createWebHistory('/'),
  history: createWebHashHistory(),
  routes
});
router.beforeEach((to, from, next) => {
  console.log('开始加载');
  if (to.path === '/') {
    next({ path: '/home' });
  } else {
    next();
    setItem({ name: 'urlRecord', value: to.path });
  }
});
router.afterEach((to, from) => {
  console.log('加载完成');
});
getUserMenuMap().then((res) => {
  const userMenu = setRouter(res);
  for (let i = 0; i < userMenu.length; i++) {
    const element = userMenu[i];
    router.addRoute('base', element);
  }
  const prevUrl = getItem('urlRecord');
  if (prevUrl) {
    router.push(prevUrl);
  } else {
    router.push('/home');
  }
});

export default router;
