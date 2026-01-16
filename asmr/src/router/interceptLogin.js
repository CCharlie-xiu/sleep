import { beforeEach, afterNotNext } from "uni-crazy-router"
import { useUserStore } from "@/store/user"
import useRouterStore from "@/store/router";
import { storeToRefs } from "pinia"
import { HAS_LOGIN_ROUTE_PATH } from '@/common/data/constants'
import { getStorageSync, setStorageSync } from "@/common/utils/storage.js";
import { IS_BUY_MEMBER } from "@/common/data/constants";
let intercept
export function injectInterceptLogin() {
  destroyIntercept()
  intercept = beforeEach(async (to, from, next) => {
    const { hasLogin } = storeToRefs(useUserStore());
    // #ifdef MP-KUAISHOU
    try {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const page = pages[pages.length - 1];
        const backPage = ["/minePages/goods/points", "/minePages/goods/member"];
        if (
          backPage.includes(page.route) &&
          to.jumpType === "navigateBack" &&
          page.$vm.popupConfig?.visible == "true" &&
          page.$vm.popupConfig?.popupTime == "back"
        ) {
          // 如果需要拦截 && 还没拦截过
          if (getStorageSync(IS_BUY_MEMBER) == "0") {
            page.$vm.showPopup = true;
            setStorageSync(IS_BUY_MEMBER, "1");
            return; // 拦截路由
          } else if (getStorageSync(IS_BUY_MEMBER) == "1") {
            setStorageSync(IS_BUY_MEMBER, "0");
          }
        }
      }
    } catch (error) {
      console.log("路由拦截处理出错:", error);
    }
    // #endif
    console.log('router intercept #debug =======>', to, hasLogin.value);
    if (HAS_LOGIN_ROUTE_PATH.includes(to.url) && from.url !== 'pages/login/login' && !hasLogin.value) {
      console.log('setNextPage', to, hasLogin.value);
      const { setNextPage } = useUserStore();
      const { getRouterParams } = useRouterStore();
      setNextPage({
        path: '/' + to.url,
        query: to.query,
        params: {...getRouterParams()}
      })
      // #ifdef MP-KUAISHOU
      ks.navigateTo({
        url: "/pages/login/login",
      });
      // #endif
      // #ifndef MP-KUAISHOU
      afterNotNext(() => {
        uni.navigateTo({
          url: "/pages/login/login",
        });
      });
      // #endif
      return // 拦截路由，不执行next
    }
    next()
  })
}
export function destroyIntercept() {
  if (intercept) {
    intercept() // 销毁拦截
    intercept = null
  }
}