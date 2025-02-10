import { useSettingStore } from '@/stores/setting';
//全局状态
const settingStore = useSettingStore();

//参数
const notModeType: { [key: string]: boolean } = { slide: true };
//如果参数中有这个type那么就返回default
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
  if (settingStore.fullScreen === 0) {
    if (window.innerWidth <= 992) {
      if (!settingStore.menuCollapse) {
        settingStore.menuCollapse = true;
      }
    } else {
      if (settingStore.menuCollapse) {
        settingStore.menuCollapse = false;
      }
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
