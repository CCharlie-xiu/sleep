import { afterEach, afterNotNext } from "uni-crazy-router"
let intercept
export function injectInterceptCommon() {
  destroyIntercept()
  intercept = afterEach(async (to, from, next) => {
    console.log('to, from debug ====> ', to, from);
    if (to.query && to.query.t) {
      uni.setNavigationBarTitle({
        title: to.query.t
      })
    }
    next && next();
  })
  // afterNotNext(async (to, from) => {
  // })
}
export function destroyIntercept() {
  if (intercept) {
    intercept() // 销毁拦截
    intercept = null
  }
}