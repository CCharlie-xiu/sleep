import { defineStore } from "pinia";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import { VUEX_PARAMS } from '@/common/data/constants';

export default defineStore("router", () => {
  let routerParams = getStorageSync(VUEX_PARAMS) || null; 
  // 相当于actions
  const setRouterParams = (data) => {
    routerParams = data;
    setStorageSync(VUEX_PARAMS, routerParams);
  }
  const getRouterParams = () => {
    return routerParams;
  }
  return {
    setRouterParams,
    getRouterParams,
  }
});