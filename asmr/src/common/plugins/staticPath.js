// 静态路径挂载

export default {
  install(app) {
    const globalProperties = app.config.globalProperties;
    const themeName = globalProperties.$themeName;
    // 静态路径
    globalProperties.$staticPath = {
      // 首页模块
      index: OSS_URL + '/static/index/' + themeName,
      indexBg: (OSS_URL ? OSS_URL + '/' : '') + 'static/index/' + themeName,
      indexLocal: '/static/index/' + themeName,
      // 公共模块
      common: OSS_URL + '/static/common/' + themeName,
      commonBg: (OSS_URL ? OSS_URL + '/' : '') + 'static/common/' + themeName,
      commonLocal: '/static/common/' + themeName,
      // 玩法模块
      play: OSS_URL + '/static/play/' + themeName,
      playBg: (OSS_URL ? OSS_URL + '/' : '') + 'static/play/' + themeName,
      playLocal: '/static/play/' + themeName,
      // 福利模块
      free: OSS_URL + '/static/free/' + themeName,
      freeBg: (OSS_URL ? OSS_URL + '/' : '') + 'static/free/' + themeName,
      freeLocal: '/static/free/' + themeName,
      // 个人中心模块
      mine: OSS_URL + '/static/mine/' + themeName,
      mineBg: (OSS_URL ? OSS_URL + '/' : '') + 'static/mine/' + themeName,
      mineLocal: '/static/mine/' + themeName,
    };
    // oss地址
    globalProperties.$ossUrl = OSS_URL;
    // 获取oss图片地址
    globalProperties.$getImg = (url = '') => {
      return OSS_URL + url
    };
  }
}