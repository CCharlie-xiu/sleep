// 网络状态监听
import { defineStore } from "pinia";
import useGuide from './guide';
import initData from "@/common/initModule/init";
export const useNetworkStore = defineStore("network", () => {
  const networkType = ref(true);
  try {
    uni.onNetworkStatusChange((res) => {
      networkType.value = res.networkType !== "none";
      console.log('网络状态变化 =====>', networkType.value);
      // #ifdef APP-PLUS
      const { showGuide } = useGuide();
      // 只有在有网络的时候，并且有网络类型，并且是第一次打开引导页的时候，才触发重新连接逻辑
      console.log('触发重载 =====>', res.isConnected, networkType.value, showGuide);
      if(res.isConnected && networkType.value && showGuide){
        uni.reLaunch({
          url: '/pages/index/index'
        });
        // 重新获取静默登录
        initData();
      }
      // #endif
    });
    uni.getNetworkType({
      success: (res) => {
        networkType.value = res.networkType !== "none";
        console.log('网络状态获取成功 =====>', networkType.value)
      }
    });
  } catch (e) {
    //TODO handle the exception
  }

  return {
    networkType
  }
});