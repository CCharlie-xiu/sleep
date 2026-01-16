// src/common/ad/platforms/weixin.js
class WeixinAdAdapter {
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
        reject(new Error('请传入广告参数'));
      }
      if (wx.createRewardedVideoAd) {
        this.rewardedVideoAd && this.rewardedVideoAd.destroy();
        this.rewardedVideoAd = wx.createRewardedVideoAd(params);

        this.rewardedVideoAd.onLoad(() => {
          console.log('微信激励视频广告加载成功');
          resolve(true);
        });

        this.rewardedVideoAd.onError((err) => {
          console.error('微信激励视频广告加载失败', err);
          reject();
        });

        this.rewardedVideoAd.onClose((res) => {
          console.log('微信激励视频广告关闭', res);
          this.resolve && this.resolve(res);
        });

      } else {
        console.warn('当前微信版本不支持激励视频广告');
        reject();
      }
    })
  }

  /**
   * 创建插屏广告
   */
  createInterstitialAd(params) {
    return new Promise((resolve, reject) => {
      if (!params) {
        reject(new Error('请传入广告参数'));
      }
      // 微信小程序基础库版本要求 >= 2.6.0
      if (wx.createInterstitialAd) {
        this.interstitialAd && this.interstitialAd.destroy();
        this.interstitialAd = wx.createInterstitialAd(params);
  
        this.interstitialAd.onLoad(() => {
          console.log('微信插屏广告加载成功');
          resolve(true);
        });
  
        this.interstitialAd.onError((err) => {
          console.error('微信插屏广告加载失败', err);
          reject();
        });

        this.interstitialAd.onClose((res) => {
          console.debug('微信插屏广告加载关闭', res);
          this.resolve && this.resolve(res);
        });
  
      }else{
        console.warn('当前微信版本不支持插屏广告');
        reject();
      }
    })
  }

  /**
   * 显示激励视频广告
   */
  showRewardedVideoAd() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      if (!this.rewardedVideoAd) {
        reject(new Error('激励视频广告未初始化'));
        return;
      }
      this.rewardedVideoAd.show().catch(() => {
        // 失败重试一次
        this.rewardedVideoAd.load()
          .then(() => this.rewardedVideoAd.show())
          .catch(err => {
            console.error('激励视频广告显示失败', err);
            reject(err);
          });
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
        reject(new Error('激励视频广告未初始化'));
        return;
      }
  
      return this.interstitialAd.show().catch(err => {
        console.error('插屏广告显示失败', err);
        reject(err);
      });

    })
  }
}

export default WeixinAdAdapter;