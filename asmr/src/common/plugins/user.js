import { useUserStore } from "@/store/user";
import { storeToRefs } from "pinia";
export default {
  install(app) {
    const { hasLogin, credit, hasEffectiveToken } = storeToRefs(useUserStore());
    app.config.globalProperties.$hasLogin = hasLogin;
    app.config.globalProperties.$credit = credit;
    app.config.globalProperties.$hasToken = hasEffectiveToken;
  }
}