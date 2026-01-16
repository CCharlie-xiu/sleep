// src/common/ad/platforms/weixin.js
import { faltAdConfig, obj2KeyValue } from "@/common/ad/manage";
class KsAdAdapter {
  constructor() {
    this.rewardedVideoAd = null;
    this.interstitialAd = null;
    this.resolve = null;
    this.reject = null;
  }

  /**
   * 创建激励视频广告
   */
  createRewardedVideoAd(params) {
    return new Promise((resolve, reject) => {
      if (!params) {
        reject(new Error("请传入广告参数"));
      }
      if (ks.createRewardedVideoAd) {
        this.rewardedVideoAd && this.rewardedVideoAd.destroy();
        const query = params.reduce((acc, item) => {
          if (item.key && item.value !== undefined) {
            acc[item.key] = item.value;
          }
          return acc;
        }, {});
        this.rewardedVideoAd = ks.createRewardedVideoAd(query);

        this.rewardedVideoAd.onLoad(() => {
          console.log("快手激励视频广告加载成功");
          resolve(true);
        });

        this.rewardedVideoAd.onError((err) => {
          console.error("快手激励视频广告加载失败", err);
          reject();
        });

        this.rewardedVideoAd.onClose((res) => {
          console.log("快手激励视频广告关闭", res);
          this.resolve && this.resolve(res);
        });
      } else {
        console.warn("当前快手版本不支持激励视频广告");
        reject();
      }
    });
  }

  /**
   * 创建插屏广告
   */
  createInterstitialAd(params) {
    return new Promise((resolve, reject) => {
      if (!params) {
        reject(new Error("请传入广告参数"));
      }
      // 微信小程序基础库版本要求 >= 2.6.0
      if (ks.createInterstitialAd) {
        this.interstitialAd && this.interstitialAd.destroy();
        this.interstitialAd = ks.createInterstitialAd(params);

        this.interstitialAd.onLoad(() => {
          console.log("微信插屏广告加载成功");
          resolve(true);
        });

        this.interstitialAd.onError((err) => {
          console.error("微信插屏广告加载失败", err);
          reject();
        });

        this.interstitialAd.onClose((res) => {
          console.debug("微信插屏广告加载关闭", res);
          this.resolve && this.resolve(res);
        });
      } else {
        console.warn("当前微信版本不支持插屏广告");
        reject();
      }
    });
  }

  /**
   * 显示激励视频广告
   */
  showRewardedVideoAd() {
    return new Promise((resolve, reject) => {
      if (!this.rewardedVideoAd) {
        reject(new Error("激励视频广告未初始化"));
        return;
      }

      // 定义广告回调
      const adCallbacks = {
        onClose: (res) => {
          resolve(res);
        },
        onError: (err) => {
          console.error("激励视频广告错误", err);
          // 失败后重试一次
          this.rewardedVideoAd
            .load()
            .then(() => {
              this.rewardedVideoAd.show().catch((e) => reject(e));
            })
            .catch((e) => reject(e));
        },
      };

      // 绑定事件（快手小程序可能需要用 off 先解绑旧事件）
      this.rewardedVideoAd.offClose();
      this.rewardedVideoAd.offError();
      this.rewardedVideoAd.onClose(adCallbacks.onClose);
      this.rewardedVideoAd.onError(adCallbacks.onError);

      // 展示广告
      this.rewardedVideoAd.show().catch((err) => {
        console.warn("首次展示失败，尝试重试", err);
        // 直接触发重试逻辑（已在 onError 中处理）
      });
    });
  }

  /**
   * 显示插屏广告
   */
  showInterstitialAd() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      if (!this.interstitialAd) {
        reject(new Error("激励视频广告未初始化"));
        return;
      }

      return this.interstitialAd.show().catch((err) => {
        console.error("插屏广告显示失败", err);
        reject(err);
      });
    });
  }
}

export default KsAdAdapter;
