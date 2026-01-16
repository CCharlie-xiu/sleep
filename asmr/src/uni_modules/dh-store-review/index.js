/**
 * uni-app iOS / Android 应用评分插件
 * 独立函数封装
 */

/**
 * 跳转到 App Store 应用市场评分页
 * @param {Object} options
 *  options.action: iOS 官方支持的 action, 默认为空, 可选值 'write-review'
 */
export const openAppstore = (options = {}) => {
  if (plus.os.name == 'iOS') {
    if (!options.iosAppId) {
      console.warn('请传入 iosAppId');
      return;
    }
    const url =
      options.action == 'write-review'
        ? `itms-apps://itunes.apple.com/app/id${options.iosAppId}?action=write-review`
        : `itms-apps://itunes.apple.com/app/id${options.iosAppId}`;
    plus.runtime.openURL(url);
  } else {
    console.log('当前平台暂不支持');
  }
};

/**
 * iOS 应用内评分
 */
export const iosRequestReview = () => {
  if (plus.os.name === 'iOS') {
    const SKStoreReviewController = plus.ios.import('SKStoreReviewController');
    if (SKStoreReviewController && SKStoreReviewController.requestReview) {
      SKStoreReviewController.requestReview();
      plus.ios.deleteObject(SKStoreReviewController);
    } else {
      console.log('当前系统不支持 requestReview');
    }
  } else {
    console.log('requestReview 仅支持 iOS 平台');
  }
};

/**
 * 通用评分方法
 * 优先 iOS 应用内评分，不可用则跳转 App Store
 * @param {Object} options
 *  options.iosAppId: iOS App Store ID
 */
export const review = (options = {}) => {
  if (plus.os.name === 'iOS') {
    const SKStoreReviewController = plus.ios.import('SKStoreReviewController');
    if (SKStoreReviewController && SKStoreReviewController.requestReview) {
      SKStoreReviewController.requestReview();
      plus.ios.deleteObject(SKStoreReviewController);
    } else {
      openAppstore({ iosAppId: options.iosAppId, action: 'write-review' });
    }
  } else {
    console.log('当前平台暂不支持评分操作');
  }
};
