import useRouterStore from "@/store/router";
import { obj2url } from "@/common/utils/util";
const routerEncry = ({ path = "", params, method }) => {
  const { setRouterParams } = useRouterStore();
  if (params) {
    setRouterParams(params);
    if (params.query) {
      path = path + "?" + obj2url(params.query);
    }
  }else{
    setRouterParams({});
  }
  uni[method]({
    url: path,
    ...params,
    success: function (res) {
      // 跳转成功
      console.log("跳转成功");
    },
    fail: function (err) {
      // 跳转失败
      console.log("跳转失败", err);
      if(err && !(err.errMsg === 'beforeEach中没有使用next' || err.errMsg.includes('navigateBack intercepted'))){
        // 默认回首页
        routerJump.replaceAll('/pages/index/index')
      }
    },
  });
};

const routerJump = {
  push: function (path, params) {
    routerEncry({
      method: "navigateTo",
      path: path,
      params,
    });
  },
  replace: function (path, params) {
    routerEncry({
      method: "redirectTo",
      path: path,
      params,
    });
  },
  pushTab: function (path, params) {
    routerEncry({
      method: "switchTab",
      path: path,
      params,
    });
  },
  replaceAll: function (path, params) {
    routerEncry({
      method: "reLaunch",
      path: path,
      params,
    });
  },
  back: function (params) {
    routerEncry({
      method: "navigateBack",
      params,
    });
  },
  getRouterParams: function () {
    const options = this.getRoute().options;
    const { getRouterParams } = useRouterStore();
    const data = getRouterParams() || {};
    if (options) {
      data.query = {
        ...options,
      };
    }
    return data;
  },
  getRoute() {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
  },
  install(app) {
    app.config.globalProperties.$Router = routerJump;
  },
};

export default routerJump;
