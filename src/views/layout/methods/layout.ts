import { nextTick } from 'vue';
import { useSettingStore } from '@/stores/setting';
//全局状态
const settingStore = useSettingStore();

//参数
const notModeType: any = { slide: true };
//函数|逻辑代码
export function getTransitionType(type: string) {
  if (type) {
    if (notModeType[type]) {
      return 'default';
    } else {
      return 'out-in';
    }
  } else {
    return 'default';
  }
}
export function hideMenu() {
  settingStore.menuCollapse = true;
}
export function windowResize() {
  if (window.innerWidth <= 992) {
    if (!settingStore.menuCollapse) {
      settingStore.menuCollapse = true;
    }
  } else {
    if (settingStore.menuCollapse) {
      settingStore.menuCollapse = false;
    }
  }
  if (
    document.fullscreenElement ||
    document.msFullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    false
  ) {
    console.log(1);
  } else {
    if (settingStore.fullScreen !== 1) {
      settingStore.fullScreen = 0;
    }
  }
}
export function windowKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Escape':
      settingStore.fullScreen = 0;
      break;
    default:
      break;
  }
}
