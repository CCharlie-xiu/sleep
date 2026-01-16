import { getCurrentInstance, ref, computed } from 'vue';

export default ({
  pageCode,
  adScene = '' 
} = {}) => {
  const { proxy } = getCurrentInstance();
  const adBanaerList = ref([]); // 原始广告数据
  const adListByScene = ref({}); // 按 adScene 分类的广告数据

  const hasAd = computed(() => adBanaerList.value.length > 0);

  // 解析 adScene 并初始化 adListByScene
  const parseAdScenes = (sceneStr) => {
    if (!sceneStr) return {};
    return sceneStr.split(',').reduce((acc, scene) => {
      acc[scene.trim()] = []; // 初始化每个 scene 对应的空数组
      return acc;
    }, {});
  };

  // 根据 adScene 分类广告数据
  const classifyAdsByScene = (ads) => {
    const scenes = adScene.split(',');
    const classified = { ...adListByScene.value };
    scenes.forEach(scene => {
      const sceneKey = scene.trim();
      classified[sceneKey] = ads.filter(ad => ad.adScene === sceneKey);
    });
    adListByScene.value = classified;
  };

  const getBanaerAd = (params) => {
    return new Promise((resolve, reject) => {
      adBanaerList.value = [];
      adListByScene.value = parseAdScenes(adScene); // 初始化分类结构
      getAdList({
        pageCode,
        adScene,
        ...params
      })
        .then(res => {
          adBanaerList.value = res.data.showAd.records || [];
          classifyAdsByScene(adBanaerList.value); // 分类广告数据
          return proxy.$adManager.init(adBanaerList.value);
        })
        .then(resolve)
        .catch(err => {
          reject(err);
        });
    });
  };

  return {
    hasAd,
    adBanaerList, // 原始广告数据
    adListByScene, // 按 adScene 分类的广告数据（如 { home: [...], detail: [...] }）
    getBanaerAd,
  };
};