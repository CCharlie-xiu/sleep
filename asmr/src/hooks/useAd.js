// 广告hooks
// API 调用已移除 - ad API
import { initMemberInfo } from "@/common/initModule/mpInit.js";
import { getCurrentInstance } from 'vue';
export default ({
  pageCode,
  adScene,
} = {}) => {
  const { proxy } = getCurrentInstance();
  const adList = ref([]);
  const adActivity = ref({});
  const uniAdRef = ref();
  const hasAd = computed(() => adList.value.length > 0);
  const adBanaerList = ref([]); // 原始广告数据
  const adListByScene = ref({}); // 按 adScene 分类的广告数据

  const getAd = (params) => {
    return new Promise((resolve, reject) => {
      adListByScene.value = parseAdScenes(adScene); // 初始化分类结构
      // adList.value = [];
      getAdList({
        pageCode,
        adScene,
        ...params,
      })
        .then((res) => {
          console.log("res debug ====> ", res);
          const records = res.data.showAd.records;
          adList.value = records.filter((item) => item.type !== "banner");
          adBanaerList.value = records.filter(
            (item) => item.type === "banner"
          );
          classifyAdsByScene(adBanaerList.value, adScene); // 分类广告数据
          return proxy.$adManager.init(adList.value);
        })
        .then((res) => {
          resolve(res)
        })
        .catch(err => {
          console.log(err);
          reject(err);
        })
    })
  }
  const showAd = ({ reportParams, adParams }, otherParams) => {
    return new Promise((resolve, reject) => {
      const {
        isShowToast = true,
        isRefreshUser = true
      } = otherParams || {};
      isShowToast && proxy.$Tips.loading();
      !reportParams && adActivity.value && (reportParams = {
        activityId: adActivity.value.id,
        adScene: adParams.adScene ? adParams.adScene : adScene,
        pageCode,
      })
      proxy.$adManager.show(adParams)
        .then((res) => {
          if (res.isEnded === true || res.isEnded  == 1) {
            return submitAd({
              ...reportParams,
              ...res.currentAdParams
            })
          } else if (res.isEnded === false || res.isEnded == 0) {
            reject('广告未完整观看');
            setTimeout(() => {
              isShowToast && proxy.$Tips.toast('广告未完整观看, 无法领取奖励');
            }, 100);
          }
        })
        .then((res) => {
          proxy.$Tips.loaded();
          isRefreshUser && initMemberInfo();
          resolve(res);
        })
        .catch(err => {
          // #ifdef MP-WEIXIN
          if (uniAdRef.value) {
            uniAdRef.value.showAd(
              reportParams,
              adParams,
              {
                isShowToast,
                isRefreshUser,
                ...otherParams
              }
            );
            return;
          }
          // #endif
          reject(err);
          isShowToast && proxy.$Tips.toast(err);
          proxy.$Tips.loaded();
        })
    })
  }
  const getAdByActivity = async (params, adParams) => {
    params = {
      pageCode,
      adScene,
      ...params,
    };
    const adActivityData = await queryAdActivity(params);
    adActivity.value = adActivityData.data.queryAdActivity.record;
    getAd(adParams);
  };

  // 解析 adScene 并初始化 adListByScene
  const parseAdScenes = (sceneStr) => {
    if (!sceneStr) return {};
    return sceneStr.split(",").reduce((acc, scene) => {
      acc[scene.trim()] = []; // 初始化每个 scene 对应的空数组
      return acc;
    }, {});
  };

  // 根据 adScene 分类广告数据
  const classifyAdsByScene = (ads) => {
    const scenes = adScene.split(",");
    const classified = { ...adListByScene.value };
    scenes.forEach((scene) => {
      const sceneKey = scene.trim();
      classified[sceneKey] = ads.filter((ad) => ad.adScene === sceneKey);
    });
    adListByScene.value = classified;
  };

  return {
    hasAd,
    adList,
    uniAdRef,
    adActivity,
    adBanaerList, // 原始广告数据
    adListByScene, // 按 adScene 分类的广告数据（如 { home: [...], detail: [...] }）
    getAd,
    showAd,
    getAdByActivity,
  };
};
