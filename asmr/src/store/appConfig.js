import { defineStore } from "pinia";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import { APP_CONFIG } from "@/common/data/constants";
import { appID, appConfig } from "@/common/initModule/mpInit.js";
import { isIosAndMac } from "@/common/data/staticData";
import { computed } from "vue";

export const useaAppConfigStore = defineStore("appConfig", () => {
  const config = ref(appConfig || {});
  const SET_CONFIG = (data) => {
    config.value = data;
    setStorageSync(APP_CONFIG, data);
  };

  const getAppConfigInfo = () => {
    // API 调用已移除 - getAppConfig
    // TODO: 需要实现应用配置获取逻辑
    SET_CONFIG({});
    return Promise.resolve(false);
  };

  const memberEntrance = computed(() => {
    return config.value.memberEntrance == 'true';
  });

  const pointEntrance = computed(() => {
    return config.value.pointEntrance == 'true';
  });

  const isGuideToMember = computed(() => {
    return config.value.isGuideToMember == 'true';
  });

  const adEntrance = computed(() => {
    return config.value.adEntrance == 'true';
  })

  const fisrtShowGuide = computed(() => {
    return config.value.fisrtShowGuide == 'true'
  })

  return {
    config,
    fisrtShowGuide,
    memberEntrance,
    adEntrance,
    pointEntrance,
    isGuideToMember,
    getAppConfigInfo,
  };
});
