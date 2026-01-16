// 主题变量挂载
let themeConfig = {};
try {
  themeConfig = THEME_CONFIG;
} catch (error) {
  
}
const global = {
  //配置空数据图默认描述文字为：空空如也
  'empty-view-text': '空空如也',
  // 空图片
  emptyViewImg: '/static/common/' + themeConfig.name + '/empty.png',
  // 无网络图片
  noNetworkImg: '/static/common/' + themeConfig.name + '/network.png',
  // 无网络描述文字
  noNetworkText: '当前网络不可用，请检查网络设置',
  // 加载错误图片
  emptyViewErrorImg: '/static/common/' + themeConfig.name + '/error.png',
  // 空数据图“加载失败”描述文字
  'empty-view-error-text': '很抱歉，加载失败',
  // 重新加载文字
  'empty-view-reload-text': '重试',
  // 空数据图 描述文字样式
  'empty-view-title-style': {
    fontSize: '28rpx',
    color: themeConfig.var_border_v18_color,
    marginTop: '50rpx'
  },
  // 空数据图 重试按钮样式
  'empty-view-reload-style': {
    border: '2rpx solid ' + themeConfig.var_border_v18_color,
    padding: '26rpx 82rpx',
    lineHeight: '32rpx',
    borderRadius: '82rpx',
    textAlign: 'center',
    color: themeConfig.var_font_v76_color,
    fontSize: '32rpx'
  },
  // 空数据图片样式
  'empty-view-img-style': {
    width: '215rpx',
    height: '178rpx'
  },
  // 空数据图父view样式
  'empty-view-super-style': {
    minHeight: '900rpx',
  }
  // emptyViewFixed: true
}
export default {
  install(app) {
    const globalProperties = app.config.globalProperties;
    if (themeConfig) {
      // const cssvar = Object.keys(themeConfig)
      //   .filter((key) => {
      //     return key.startsWith("var");
      //   })
      //   .map((key) => {
      //     return `--${key}: ${themeConfig[key]};`;
      //   });
      // globalProperties.$themeVar = cssvar.concat('--theme-bg-url: url('+ OSS_URL + '/static/common/' + themeConfig.name + '/bg.png)');
      globalProperties.$themeConfig = themeConfig;
      globalProperties.$themeName = themeConfig.name;
      // console.log('$themeConfig #debug =======>', import.meta.env);
    }
  }
}

export {
  themeConfig,
  global
}; 