// import store from "@/store/user.js";
import {
  APP_INFO,
  APP_CONFIG,
  PLATFORMENUM as platformEnum,
  website,
} from "@/common/data/constants.js";
import { getStorageSync, setStorageSync } from "@/common/utils/storage.js";
import { useUserStore } from "@/store/user.js";
import { useaAppConfigStore } from "@/store/appConfig";
import { osName } from "@/common/data/staticData.js";
import { useDrawingStore } from "@/store/drawing";
// #ifdef APP-PLUS
import { keychainPlus, rsaEncrypt } from "@/common/utils/util.js";
// #endif
// var 声明提升 防止Uncaught ReferenceError: Cannot access 'appID' before initialization
export var appID = getStorageSync(APP_INFO) || "";
export var appConfig = getStorageSync(APP_CONFIG);
export const loginCode = "";
export function initAppInfo() {
  return new Promise((resolve, reject) => {
    console.log("appID log ====> ", appID);
    if (appID) {
      resolve();
    } else {
      // #ifdef MP-WEIXIN || MP-KUAISHOU || MP-ALIPAY
      const appInfo = uni.getAccountInfoSync();
      appID = appInfo.miniProgram.appId;
      // #endif
      // #ifdef MP-TOUTIAO
      const { microapp } = tt.getEnvInfoSync();
      appID = microapp.appId;
      // #endif
      // #ifdef APP-PLUS
      console.log("SYSTEM_CONFIG log ====> ", SYSTEM_CONFIG);
      appID = SYSTEM_CONFIG.appid;
      // #endif
      setStorageSync(APP_INFO, appID);
      console.debug("appinfo", appID);
      resolve();
    }
  });
}
// 校验登录是否失败
export function checkLoginSession() {
  return new Promise((resolve, reject) => {
    uni.checkSession({
      success(res) {
        resolve();
        // console.debug("session 未过期", res, store.state);
      },
      fail(err) {
        reject();
        // console.debug("session 已过期，需要重新登录", err, store.state);
      },
    });
  });
}

export function getAppConfigInfo() {
  const { getAppConfigInfo } = useaAppConfigStore();
  // 等待配置获取完成
  getAppConfigInfo()
    .then((success) => {
      if (success) {
        const { checkReLogin } = useUserStore();
        checkReLogin().catch(() => initLogin());
      }
    })
    .catch((err) => {
      console.log("err", err);
    });
}

export function initLogin() {
  return new Promise((resolve, reject) => {
    checkLoginSession()
      .then(() => {
        mpLogin(resolve, reject);
        // if (store.state.token) {
        // 	resolve();
        // 	initUserInfo();
        // 	// updateUserLoginTime();
        // 	// mpLogin(resolve, reject)
        // } else {
        // 	mpLogin(resolve, reject);
        // }
      })
      .catch(() => {
        mpLogin(resolve, reject);
      });
  });
}

/**
 * 登录
 */
export function mpLoginInterFace() {
  return new Promise((resolve, reject) => {
    // #ifdef MP
    uni.login({
      success(loginSuc) {
        // setStorageSync(LOGIN_CODE, loginSuc.code);
        // loginCode = loginSuc.code;
        resolve(loginSuc);
        console.debug("登录接口成功", loginSuc);
      },
      fail(loginFail) {
        reject(loginFail);
        console.debug("登录接口失败", loginFail);
      },
    });
    // #endif
    // #ifdef APP-PLUS
    resolve({ msg: "mpLoginInterFace" });
    // #endif
  });
}

// 登录方法抽离
export async function mpLogin(resolve, reject) {
  // console.log('000000000000000000000000000000000000000000000000000000000000')
  //   const store = useUserStore();
  // const projectId = CLIENT_CONFIG[`project_${appID}`];
  const { config } = useaAppConfigStore();
  // isIos
  // #ifdef APP-PLUS
  const codeInfo = "APPLE_INIT_NEW_UUID";
  let codeRSA = "";
  // 1. 获取【GET】keychain uuid字段标识内容
  const keychainRes = await keychainPlus.get("uuid2-prod");
  // - 调用 RSA加解密函数 传递加密 uuid -> 字段code
  if (keychainRes.code == 0) {
    codeRSA = rsaEncrypt(keychainRes.value);
  } else {
    codeRSA = rsaEncrypt(codeInfo);
  }
  // #endif
  const { SET_TOKEN, SET_USER_INFO, REFRESH_TOKEN, SET_REFRESH_TOKEN } =
    useUserStore();
  mpLoginInterFace()
    .then((loginSuc) => {
      const params = {
        // #ifdef APP-PLUS
        grant_type: "apple_keychain",
        scope: website.scope,
        projectId: config.projectId,
        source: platformEnum,
        tenantId: "000000",
        code: codeRSA,
        // #endif
        // #ifdef MP
        appId: appID,
        code: loginSuc.code,
        source: platformEnum,
        scope: website.scope,
        projectId: config.projectId,
        grant_type: "social",
        platform: osName,
        // #endif
        version: import.meta.env.VITE_APP_VERSION,
      };
      // API 调用已移除 - mpUserLogin
      // TODO: 需要实现登录逻辑
      const { adjustQueue } = useDrawingStore();
      adjustQueue();
      reject && reject();
      isReLogin = false;
    })
    .catch((err) => {
      console.log(err, "errrr");
      isReLogin = false;
      reject && reject();
    });
}
// 获取会员信息
let count = 0;
let isReLogin = false;
export function initMemberInfo(resolve, reject) {
  // API 调用已移除 - getProfile
  // TODO: 需要实现获取会员信息逻辑
  reject && reject();
}

function mpInitData() {
  return new Promise((resolve) => {
    console.log("mpInitData appID log ====> ", appID);
    const promiseList = [initAppInfo(), getAppConfigInfo()];
    Promise.all(promiseList).finally(() => {
      resolve();
    });
  }).catch((e) => {
    console.debug(e);
  });
}
export default mpInitData;

// 重试登录方法
let retryCount = 0;
export const reLogin = async () => {
  const MAX_RETRY_COUNT = 1; // 设置最大重试次数
  console.log("reLogin retryCount ====> ", retryCount);
  if (retryCount < MAX_RETRY_COUNT) {
    retryCount++;
    await initLogin();
    return true;
  } else {
    retryCount = 0;
    return false;
  }
};
