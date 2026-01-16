import uniCrazyRouter, { onError } from "uni-crazy-router";
import { injectInterceptLogin } from "./interceptLogin";
import { injectInterceptCommon } from "./interceptCommon";
export function setupRouter(app) {
  // 接收vue3的实例，并注册uni-crazy-router
  app.use(uniCrazyRouter);
  // 注册登录拦截
  injectInterceptLogin();
  // 注册公共拦截器
  injectInterceptCommon();

  onError((to, from) => {
    console.debug('路由错误 #debug ===========>', to, from);
  })
}
