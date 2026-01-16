import { defineStore } from "pinia";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import { SEARCH_HISTORY } from '@/common/data/constants';


export const useSearchHistoryStore = defineStore("searchHistory", () => {
  const history = ref(getStorageSync(SEARCH_HISTORY) || []); // 相当于state 但...解构后不具有响应性 需要使用 storeToRefs api

  // 相当于actions
  const setHistory = (data) => {
    const list = [...new Set([data, ...history.value])];
    if(list.length >= 10){
      list.pop();
    }
    history.value = list;
    setStorageSync(SEARCH_HISTORY, history.value)
  }
  const removeHistory = (index) => {
    history.value.splice(index, 1);
    setStorageSync(SEARCH_HISTORY, history.value)
    console.log('删除历史记录',history.value)
  }
  const clearHistory = () => {
    history.value = [];
    setStorageSync(SEARCH_HISTORY, history.value)
  }
  return {
    history,
    setHistory,
    removeHistory,
    clearHistory
  }
});