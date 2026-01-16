// 首页制作中的状态显示
import { defineStore } from "pinia";
import { ref } from "vue";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import { SAVE_CREATE_RECORD_LIST } from "@/common/data/constants";

export const useDrawingStore = defineStore("drawing", () => {
  const drawing = ref(false);
  const queue = ref(getStorageSync(SAVE_CREATE_RECORD_LIST) || []);
  const setDrawing = (value) => {
    drawing.value = value;
  };
  const pushQueue = (item) => {
    queue.value.push(item);
    console.log('queue.value pushQueue', queue.value);
    setStorageSync(SAVE_CREATE_RECORD_LIST, queue.value);
  };
  const shiftQueue = (num) => {
    // const first = queue.value.shift();
    // console.log("queue.value", queue.value);
    // setStorageSync(SAVE_CREATE_RECORD_LIST, queue.value);
    adjustQueue(num);
    return first;
  };

  // 获取队列数量
  const getCreateRecordCount = async () => {
    // API 调用已移除 - getRunningCntApp
    // TODO: 需要实现获取创作记录数量逻辑
    return 0;
  };

  // 矫正队列数量
  const adjustQueue = async (num) => {
    try {
      // 获取实际的创作记录
      let records;
      if (num !== undefined && num !== null) {
        records = num;
      } else {
        records = await getCreateRecordCount();
      }
      console.log('records',records);
      
      const actualCount = records;
      const currentCount = queue.value.length;
      console.log(
        `当前队列数量: ${currentCount}, 实际创作记录数量: ${actualCount}`
      );
      if (actualCount > currentCount) {
        // 需要添加队列项
        const addCount = actualCount - currentCount;
        for (let i = 0; i < addCount; i++) {
          const newItem = {
            id: Date.now() + i,
            message: `create-waiting-${Date.now()}-${i}`,
            timestamp: Date.now(),
          };
          queue.value.push(newItem);
        }
      } else if (actualCount < currentCount) {
        // 需要删除多余的队列项
        const removeCount = currentCount - actualCount;
        // 从队列末尾开始删除
        queue.value.splice(-removeCount, removeCount);
      }
      // 保存矫正后的队列到存储
      setStorageSync(SAVE_CREATE_RECORD_LIST, queue.value);
      console.log(`队列矫正完成，当前队列数量: ${queue.value.length}`);
    } catch (error) {
      console.error("矫正队列失败:", error);
    }
  };

  watch(
    () => queue.value.length,
    (len) => {
      console.log("队列长度变化:", len);
      if (len > 0) {
        setDrawing(true);
      } else {
        setDrawing(false);
      }
    },
    { immediate: true }
  );

  return {
    drawing,
    setDrawing,
    queue,
    pushQueue,
    shiftQueue,
    getCreateRecordCount,
    adjustQueue,
  };
});
