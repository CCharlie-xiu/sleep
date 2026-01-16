// 系统信息挂载
import { system } from "@/common/data/staticData";

export default {
  install(app) {
    const info = system;
    console.log('system debug ====> ', system);
    const globalProperties = app.config.globalProperties;
    // #ifdef H5 || APP-PLUS
    globalProperties.$navBarHeight = 48;
    globalProperties.$statusBarHeight = info.statusBarHeight;
    // #endif
    // #ifdef MP-TOUTIAO || MP-WEIXIN || MP-KUAISHOU
    globalProperties.$statusBarHeight = info.statusBarHeight;
    // 获取胶囊的位置
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    globalProperties.$navBarHeight =
      menuButtonInfo.bottom + menuButtonInfo.top - info.statusBarHeight * 2;
    globalProperties.$menuBtnLeft = menuButtonInfo.left;
    // #endif
    // 屏幕高度
    globalProperties.$screenHeight = info.screenHeight;
    globalProperties.$safeAreaBottom = 0;
    if (info.platform !== "android") {
      globalProperties.$safeAreaBottom = info.safeAreaInsets.bottom;
    }
    // #ifdef MP-ALIPAY
    // globalProperties.$statusBarDefHeight = info.statusBarHeight;
    globalProperties.$statusBarHeight = info.statusBarHeight;
    globalProperties.$navBarHeight = info.titleBarHeight;
    info.screen &&
      info.screen.height &&
      (globalProperties.$screenHeight = info.screen.height);
    // #endif
    // 屏幕可用宽度
    globalProperties.$windowWidth = info.windowWidth;
    // 屏幕可用高度
    globalProperties.$windowHeight = info.windowHeight;
    globalProperties.$navAStatusBarHeight = globalProperties.$statusBarHeight + globalProperties.$navBarHeight;
    globalProperties.$cssVar = `--nav-bar-height: ${globalProperties.$navAStatusBarHeight}px;--status-bar-height: ${globalProperties.$statusBarHeight}px;--nav-bar-h: ${globalProperties.$navBarHeight}px;`;
    globalProperties.$pixelRatio = info.pixelRatio;
    // globalProperties.$pixelRatio = 1.5;
    globalProperties.$sdkVersion = info.SDKVersion;
    globalProperties.$platform = info.platform;
  },
};
