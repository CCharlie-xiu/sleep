import { reactive, toRefs } from 'vue';
/**
 * @description 字典的封装，使用hooks方式返回，带数组与对象
 * @param {object} data data是传递的字典参数值
 */
export function useCodeList(data = []) {
  let stack = [];
  const dictData = reactive({
    codeObjDict: {},
    codeArrDict: {},
  });
  for (let i in data) {
    stack.push({
      func: getDictionary,
      params: data[i],
    });
  }
  const run = async () => {
    // API 调用已移除 - getDictionary
    // TODO: 需要实现字典获取逻辑
    console.warn('字典功能已禁用 - getDictionary');
  };

  if (stack.length) {
    run();
  }

  return toRefs(dictData);
}

/**
 * @description 字典的封装，使用hooks方式返回当前code的数组与对象
 * @param {string} data data是传递的字典code值
 */
export function useCode(data = '') {
  const dictData = reactive({
    objDict: {},
    arrDict: [],
  });
  const run = async () => {
    // API 调用已移除 - getDictionary
    // TODO: 需要实现字典获取逻辑
    console.warn('字典功能已禁用 - getDictionary');
  };

  run();
  return toRefs(dictData);
}

/**
 * 这个是获取字典的直接使用方法，为了兼容vue2写法无法使用hook
 * @param {string} data code的值
 * @returns promise
 */
export function codeQuery(data) {
  return new Promise((resolve, reject) => {
    // API 调用已移除 - getDictionary
    // TODO: 需要实现字典查询逻辑
    reject(new Error('字典查询功能已禁用'));
  });
}
