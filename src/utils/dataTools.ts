/**
 * 判断数据是否唯一且不为空
 * @param dataArray 源数据
 * @param key key
 * @returns
 */
export function isUniqueKeyAndNotNull(dataArray: any[], key: string): UniqueValidateResult {
  const keySet = new Set<string>();
  for (const item of dataArray) {
    if (!item[key]) {
      return UniqueValidateResult.Null; // 发现为空的key值
    }
    if (keySet.has(item[key])) {
      return UniqueValidateResult.Duplicate; // 发现重复的key值
    }
    keySet.add(item[key]);
  }
  return UniqueValidateResult.Unique; // 所有key值都是唯一的
}
export enum UniqueValidateResult {
  Unique = 1,
  Duplicate = 2,
  Null = 3
}
/**
 * 格式化日期(Y:年m:月d:日 H:时M:分S:秒)
 * @param {String} fmt 格式化样式，例如"YYYY:mm:dd HH:MM:SS"
 * @param {Date} date 被格式化的时间
 * @returns 格式化后的日期字符串
 */
export function dateFormat(fmt: string, date: Date) {
  let ret;
  const opt: any = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
    }
  }
  return fmt;
}
/**
 * 序列化对象
 * @param {Object}} data 对象
 * @returns 序列化后的对象
 */
export function ObjectFormat(data: any) {
  let d = '';
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      d += `${key}=${window.encodeURIComponent(element)}&`;
    }
  }
  return d.substring(0, d.length - 1);
}
/**
 * 递归删除对象数组中子节点{key}长度为0的属性和指定(key)的属性
 * @param {Array} data 数组对象
 * @param {String} children  子节点键名
 * @param {String} keys  键名数组
 * @returns {Array}
 */
export function clearNullChildenAndKey(data: Array<any>, children: string, keys = []) {
  return data.map((item) => {
    if (item[children]) {
      if (item[children].length > 0) {
        item[children] = clearNullChildenAndKey(item[children], children, keys);
      } else {
        delete item[children];
      }
    }
    for (let i = 0; i < keys.length; i++) {
      delete item[keys[i]];
    }
    return item;
  });
}
/**
 * 函数节流
 * @param {Function} fun 被节流的函数
 * @param {number} time 调用间隔
 * @returns 节流封装后的函数
 */
export function throttle(fun: Function, time: number) {
  let timer: number | undefined = undefined;
  return function () {
    if (!timer) {
      // eslint-disable-next-line prefer-rest-params
      fun(arguments);
      timer = window.setTimeout(() => {
        clearTimeout(timer);
        timer = undefined;
      }, time);
    }
  };
}
/**
 * 函数防抖
 * @param {Function} fun 被防抖的函数
 * @param {number} time 调用间隔
 * @returns 防抖封装后的函数
 */
export function debounce(fun: Function, time: number) {
  let timer: number | undefined = undefined;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    timer = window.setTimeout(() => {
      fun(args);
    }, time);
  };
}
//递归获取dom相对于body的偏移量
export function getOffset(dom: HTMLElement) {
  let left = 0;
  let top = 0;
  while (dom) {
    left += dom.offsetLeft;
    top += dom.offsetTop;
    dom = dom.offsetParent as HTMLElement;
    if (dom.nodeName == 'BODY') {
      break;
    }
  }
  return {
    left,
    top
  };
}
/**
 *
 * @param code
 * @returns
 */
export function getEvalVariable(code: string) {
  const res = `{${code?.match(/var(.*?)=/g)?.map(function (val) {
    const v = val.replace(/var|=/g, '');
    return v + ':' + v;
  })}}`;
  const result = eval(`(()=>{${code}return ${res}})()`);
  return result;
}

export function guid(): string {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    // S4() +
    // "-" +
    S4() +
    '-' +
    S4() +
    S4() +
    '-' +
    new Date().getTime().toString(16)
  );
}

/**
 * base64转blob
 * @param {string} urlData  base64字符串
 * @param {mime} type 图片类型
 * @returns
 */
export function base64ToBlob(urlData: string, type: string) {
  const arr = urlData.split(',');
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || type;
  // 去掉url的头，并转化为byte
  const bytes = window.atob(arr[1]);
  // 处理异常,将ascii码小于0的转换为大于0
  const ab = new ArrayBuffer(bytes.length);
  // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
  const ia = new Uint8Array(ab);

  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ab], {
    type: type
  });
}
// 校验是否含有特殊字符的正则表达式
export const regSpecialCharacters = new RegExp(
  /^[^`~!@#$%^&*()_\-+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]{1,}$/
);

//计算矩形的对角线长度
