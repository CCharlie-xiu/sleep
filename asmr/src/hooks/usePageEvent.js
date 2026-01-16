import { onUnmounted } from "vue";
// 生成8位随机字符串（字母+数字）
const generateRandomId = () => {
  const chars = `${Math.random().toString(36).substr(2, 10)}`;
  return chars;
};

// 存储当前页面的随机ID（避免重复生成）
const pageRandomIdMap = new Map();
 
// 全局事件缓存（key: "页面命名空间_事件名", value: 事件数据）
const eventCacheMap = new Map();
 
export function usePageEvent() {
  const { proxy } = getCurrentInstance();
 
  // 获取当前页面路径 + 8位随机ID
  const getPageNamespace = () => {
    const currentPage = proxy?.$Router?.getRoute?.() || {};
    const pagePath = currentPage?.route || "unknown";
 
    // 如果当前页面没有随机ID，则生成一个并存储
    if (!pageRandomIdMap.has(pagePath)) {
      pageRandomIdMap.set(pagePath, generateRandomId());
    }
 
    return `${pagePath}_${pageRandomIdMap.get(pagePath)}`;
  };
 
  /**
   * 监听页面特定事件（自动绑定命名空间 + 缓存检查）
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {boolean} useCache 是否检查缓存（默认 true）
   * @return {Function} 取消监听的函数
   */
  const onPageEvent = (eventName, callback, useCache = true) => {
    const namespace = getPageNamespace();
    const fullEventName = `${namespace}:${eventName}`;
    const cacheKey = `${namespace}_${eventName}`;
    // 检查缓存是否有未处理的事件
    if (useCache && eventCacheMap.has(cacheKey)) {
      const cachedData = eventCacheMap.get(cacheKey);
      callback(cachedData); // 立即触发缓存的事件
      eventCacheMap.delete(cacheKey); // 清理缓存
    }
    const handler = (data) => {
      callback(data);
    };
    uni.$on(fullEventName, handler);
    // 组件卸载时自动取消监听
    onUnmounted(() => {
      uni.$off(fullEventName, handler);
    });
 
    return handler; // 可用于手动取消监听
  };
 
  /**
   * 触发页面特定事件（自动绑定命名空间 + 缓存机制）
   * @param {string} eventName 事件名称
   * @param {*} data 要传递的数据
   * @param {boolean} cacheIfNoListener 如果没有监听器，是否缓存事件（默认 true）
   */
  const emitPageEvent = (eventName, data, cacheIfNoListener = true) => {
    const namespace = getPageNamespace();
    const fullEventName = `${namespace}:${eventName}`;
    const cacheKey = `${namespace}_${eventName}`;
    // 尝试触发事件（如果有监听器则直接触发）
    const listeners = uni.$listeners?.(fullEventName) || [];
    if (listeners.length > 0) {
      uni.$emit(fullEventName, data);
      return;
    }
    // 如果没有监听器，则缓存事件（可选）
    if (cacheIfNoListener) {
      eventCacheMap.set(cacheKey, data);
      // 5秒后自动清理缓存（避免内存泄漏）
      setTimeout(() => {
        if (eventCacheMap.has(cacheKey)) {
          eventCacheMap.delete(cacheKey);
          console.warn(`[usePageEvent] 缓存事件 ${cacheKey} 已超时清理`);
        }
      }, 5000);
    }
  };
 
  return {
    onPageEvent,
    emitPageEvent,
  };
}