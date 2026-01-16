// 小程序启动后30秒内才能展示插屏广告
const AFTER_LAUNCH_TIME = 31000;
// 距离上次展示广告60秒后，才能展示插屏广告
const NEXT_SHOW_TIME = 61000;
// 是否可以展示广告
let canShow = false;
let timer = null;
// 是否为第一次展示广告
let isFirstShow = true;
// 休眠函数
function sleep(ms) {
  if (timer) {
    clearTimeout(timer);
  }
  return new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve({});
    }, ms);
  });
}

class AdController {
  /**
   * @description: 控制广告是否展示
   * @return {boolean}
   */
  get canShow() {
    return canShow;
  }

  /**
   * @description: 判断广告是否第一次展示
   * @return {boolean}
   */
  get isFirstShow() {
    return isFirstShow;
  }
}

const controller = new AdController();


class InterstitialAdController {
  constructor(adid) {
    
  }
  createAd(adid){
    if(adid !== this.adid && this.adid){
      this.destoryAd();
    }else if(adid === this.adid){
      return;
    }
    // 初始化 & 加载插屏广告
    this.adid = adid;
    this.ad = tt.createInterstitialAd({
      adUnitId: this.adid,
    });
    this.ad.load();
  }

  /**
   * @description: 在app的onLaunch方法中调用
   * @return {Promise<void>}
   */
  async onAppLaunch() {
    // 小程序启动30秒后将canShow置为true，表示可以播放插屏广告
    await sleep(AFTER_LAUNCH_TIME);
    canShow = true;
  }

  /**
   * @description: 展示插屏广告
   * @return {Promise<void>}
   */
  showAd() {
    // 如果canShow=false，则不能播放视频
    if (!controller.canShow) return;

    // 展示插屏广告
    this.ad.show();
    // 设置广告关闭的回调函数
    this.ad.onClose(() => {
      console.log("close");
      // 休眠60s后把canShow置为true
      this.afterNext();
      // tt.redirectTo({
      //   url: "/pages/index/index",
      // });
    });
    canShow = false;
    isFirstShow = false;
  }

  async afterNext() {
    // 休眠60s后把canShow置为true
    await sleep(NEXT_SHOW_TIME);
    canShow = true;
  }

  /**
   * @description: 返回canShow的值
   * @return {boolean}
   */
  getCanShow() {
    return controller.canShow;
  }
  /**
   * @description: 返回isFirstShow的值
   * @return {boolean}
   */
  getIsFirstShow() {
    return controller.isFirstShow;
  }

  destoryAd(){
    this.ad && this.ad.destory();
    this.ad = null;
  }
}

class RewardedVideoAdController {
  constructor(adid) {
    
  }
  createAd(adid){
    if(adid !== this.adid && this.adid){
      this.destoryAd();
    }else if(adid === this.adid){
      return;
    }
    this.adid = adid;
    this.ad = tt.createRewardedVideoAd({
      adUnitId: adid,
      multitonRewardTimes: 4,
      progressTip: true,
    });

    // 监听错误
    this.ad.onError((err) => {
      tt.hideLoading();
      switch (err.errCode) {
        case 1004:
          // 无合适的广告
          break;
        default:
        // 更多请参考错误码文档
      }
    });

    // 监听视频播放完成
    this.ad.onClose((data) => {
      console.debug('ad.onClose #debug =======>', data);
      tt.hideLoading();
      if (data.isEnded) {
        console.log("观看了", data.count, "个视频");
      } else {
        console.log("未观看完视频");
      }
      // 设置计时器，激励视屏广告展示60s内不能展示插屏广告
      sleep(NEXT_SHOW_TIME).then(() => {
        canShow = true;
      });
    });

    // 预加载资源
    this.ad.load();
  }

  showAd() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      tt.showLoading({
        title: "正在加载广告",
      });
      // 当激励视频显示时，插屏视频不能展示。
      canShow = false;
      isFirstShow = false;
      this.ad.show();
    });
    
  }

  getCanShow() {
    return controller.canShow;
  }
  destoryAd(){
    this.ad && this.ad.destory();
    this.ad = null;
  }
}

export default {
  install(app) {
    const interstitialAdController = new InterstitialAdController();
    const rewardedVideoAdController = new RewardedVideoAdController();
    interstitialAdController.onAppLaunch();
    app.config.globalProperties.$interstitialAd = interstitialAdController;
    app.config.globalProperties.$rewardedVideoAd = rewardedVideoAdController;
  }
}