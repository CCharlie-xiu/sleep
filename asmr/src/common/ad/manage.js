// src/common/ad/manage.js
// #ifdef MP-WEIXIN
import WeixinAdAdapter from './platform/wx';
// #endif
// #ifdef MP-KUAISHOU
import KsAdAdapter from "./platform/ks";
// #endif
import UniAdAdapter from './platform/uniapp';
// #ifdef MP-TOUTIAO
import DyAdAdapter from './platform/dy';
// #endif
import Tips from '@/common/utils/tips'

export const faltAdConfig = (adConfig) => {
  const len = adConfig.length;
  const list = []
  for (let i = 0; i < len; i++) {
    const item = adConfig[i];
    const { adParams: adParamArr } = item;
    let adParams = {};
    if(!adParamArr) {
      adParams = null;
    }else{
      adParamArr.forEach((item) => {
        adParams[item.key] = item.value;
      })
    }
    list.push({
      ...item,
      adParams
    })
  }
  return list;
}

export const obj2KeyValue = (obj) => {
  return Object.keys(obj).map(key => {
    return {
      key,
      value: obj[key]
    }
  })
}

class AdManager {

  adTypeEnum = {
    // 激励视频广告枚举
    rewardedVideo: {
      CREATE: 'createRewardedVideoAd',
      SHOW: 'showRewardedVideoAd',
    },
    // 插屏广告枚举
    interstitial: {
      CREATE: 'createInterstitialAd',
      SHOW: 'showInterstitialAd',
    },
  }
  constructor() {
    this.adapters = new Map();
    this.currentAdapter = null;
    this.currentPlatform = '';
    this.adType = '';
    this.adConfig = [];
    this.currentAdParamArr = null;
    this.requestId = '';
    this.adInstances = {};

    this.initPlatformAdapters();
  }

  /**
   * 初始化各平台适配器
   */
  initPlatformAdapters() {
    // #ifdef MP-WEIXIN
    // 注册微信小程序适配器
    this.adapters.set('weixin', new WeixinAdAdapter());
    // #endif
    // #ifdef MP-TOUTIAO
    // 注册抖音小程序适配器
    // this.adapters.set('dy', new DyAdAdapter());
    // #endif

    // 注册uni-app适配器
    // this.adapters.set('uni', new UniAdAdapter());

    // #ifdef MP-KUAISHOU
    // 注册快手小程序适配器
    this.adapters.set("ks", new KsAdAdapter());
    // #endif
  }

  /**
   * 检测当前运行平台并设置适配器
   */
  detectPlatform() {
    // #ifdef MP-WEIXIN
    this.currentPlatform = 'weixin';
    // #endif
    // #ifdef MP-KUAISHOU
    this.currentPlatform = "ks";
    // #endif

    // #ifdef MP-TOUTIAO
    this.currentPlatform = 'dy';
    // #endif

    this.currentAdapter = this.adapters.get(this.currentPlatform);
    return this.currentPlatform;
  }

  /**
   * 初始化广告
   */
  async init(config) {
    // this.detectPlatform();
    // if (this.currentAdapter && typeof this.currentAdapter.initEnvironment === 'function') {
    //   this.currentAdapter.initEnvironment();
    // }
    this.adConfig = config
    const faltConfig = faltAdConfig(config);
    const len = faltConfig.length;
    for (let i = 0; i < len; i++) {
      try {
        const item = config[i];
        const { platform, type, requestId, adParams, adScene } = item;
        if (!adParams) {
          throw '请配置广告参数';
        }
        // this.requestId = requestId;
        this.adInstances[adScene] = this.adConfig; 
        const adapters = this.adapters.get(platform);
        if(adapters){
           await adapters[this.adTypeEnum[type].CREATE](adParams);
        }
        // if (res) {
        //   this.currentPlatform = platform;
        //   this.adType = type;
        //   this.currentAdParamArr = adParamArr;
        //   // break
        // }
      } catch (error) {
        console.error('error error ====> ', error);
        return error;
      }
    }
    return true;
  }

  /**
   * 显示广告
   */
  async show(params) {
    // if (!this.currentPlatform) {
    //   return Promise.reject('暂无可观看广告');
    // }
    return new Promise((resolve, reject) => {
      const { adScene } = params;
      this.adConfig = this.adInstances[adScene] || this.adConfig;
      if (!this.adConfig) {
        reject('请先配置广告');
      }
      if (!params) {
        reject('请传入广告参数');
      }
      if (adScene) {
        const find = this.adConfig.find(item => item.adScene === adScene);
        if (!find) {
          reject('暂无可观看广告');
        }
        setTimeout(() => {
          Tips.loaded();
        }, 300);
        this.adapters.get(find.platform)[this.adTypeEnum[find.type].SHOW]()
          .then(res => {
            resolve({
              ...res,
              // #ifndef MP-KUAISHOU
              currentAdParams: obj2KeyValue({
                platform: find.platform,
                type: find.type,
                adParams: find.adParams,
                requestId: find.requestId
              }),
             // #endif
             // #ifdef MP-KUAISHOU
              currentAdParams: {
                platform: find.platform,
                type: find.type,
                adParams: find.adParams,
                requestId: find.requestId,
              },
            // #endif
            });
          })
          .catch(err => {
            reject(err);
          })
      } else {
        reject('请传入广告场景参数');
      }
    });
    // const len = this.adConfig.length;
    // for (let i = 0; i < len; i++) {
    //   try {
    //     const item = this.adConfig[i];
    //     const { platform, type } = item;
    //     const res = await this.adapters.get(platform)[this.adTypeEnum[type].CREATE](adParams);
    //     if (res) {
    //       break
    //     }
    //   } catch (error) {
    //     return Promise.reject(new Error(error));

    //   }
    // }

    // return Promise.reject(new Error('当前平台不支持激励视频广告'));
  }

}

export default {
  install(app) {
    app.config.globalProperties.$adManager = new AdManager();
  }
};