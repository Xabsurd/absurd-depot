import { SUPPORT_THEMES } from './config';
import { setItem } from './localStorage';
import { getSystemTheme } from './system';

export function coverDom(parent: HTMLElement, child: HTMLElement, position: boolean = false) {
  const cover = calculateCover(
    parent.clientWidth,
    parent.clientHeight,
    child.clientWidth,
    child.clientHeight
  );
  if (position) {
    child.style.top = cover.top + 'px';
    child.style.left = cover.left + 'px';
  } else {
    child.style.marginTop = cover.top + 'px';
    child.style.marginLeft = cover.left + 'px';
  }
  child.style.width = cover.width + 'px';
  child.style.height = cover.height + 'px';
}

export function calculateCover(
  p_width: number,
  p_height: number,
  c_width: number,
  c_height: number
) {
  //根据box的高宽设置canvas使用图片的cover模式显示
  const parent_props = p_width / p_height;
  const child_props = c_width / c_height;
  if (parent_props > child_props) {
    return {
      width: p_height * child_props,
      height: p_height,
      left: (p_width - p_height * child_props) / 2,
      top: 0
    };
  } else {
    return {
      width: p_width,
      height: p_width / child_props,
      left: 0,
      top: (p_height - p_width / child_props) / 2
    };
  }
}
