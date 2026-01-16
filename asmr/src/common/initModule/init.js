// import store from "@/store/user.js";
import { initAppInfo } from "@/common/initModule/mpInit.js";
import Tips from '@/common/utils/tips.js';
// #ifdef MP || APP-PLUS
import mpInitData from "@/common/initModule/mpInit.js";

// #endif




// 总初始化
function initData() {
  return new Promise((resolve) => {
    const promiseList = [
      // #ifdef H5
      // initH5(),
      initAppInfo(),
      // initKfMiguSdk(),
      // initWxFlow(),
      // initPlanInfo()
      // #endif
      // initConfig()
    ];
    // #ifdef MP || APP-PLUS
    mpInitData();
    // store.dispatch('set_isMpBusiness', true)
    // #endif
    resolve();

    // Promise.all(promiseList).finally(() => {
    // 	resolve();
    // });
  }).catch((e) => {
    console.debug(e);
  });
}

export default initData;
