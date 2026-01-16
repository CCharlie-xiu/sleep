import { defineStore } from "pinia";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import {
  website,
  USER_INFO,
  USER_TOKEN,
  USER_REFRESH_TOKEN,
  SET_TOKEN_TIME,
  REFRESH_TOKEN as REFRESH_TOKEN_KEY,
} from "@/common/data/constants.js";
import { validatenull } from "@/common/utils/util.js";
import dayjs from "dayjs";
import { useaAppConfigStore } from "@/store/appConfig";
import { reactive, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(getStorageSync(USER_INFO) || {});
  const token = ref(getStorageSync(USER_TOKEN) || "");
  const refreshToken = ref(getStorageSync(USER_REFRESH_TOKEN) || "");
  const refreshTime = ref(null);
  const refreshLock = ref(false);
  const nextPage = ref(null);
  const { config } = useaAppConfigStore();
  const { projectId } = config;
  let setTokenTime = getStorageSync(SET_TOKEN_TIME) || null;

  const SET_TOKEN = (data) => {
    token.value = data;
    setStorageSync(USER_TOKEN, data);
    setTokenTime = Date.now();
    setStorageSync(SET_TOKEN_TIME, setTokenTime);
  };

  const SET_USER_INFO = (info) => {
    userInfo.value = { ...info };
    console.log('SET_USER_INFO',userInfo.value)
    setStorageSync(USER_INFO, info);
  };

  const UPDATA_USER_INFO = (key, val) => {
    userInfo.value[key] = val;
    setStorageSync(USER_INFO, userInfo.value);
  };

  const SET_REFRESH_TOKEN = (data) => {
    refreshToken.value = data;
    setStorageSync(REFRESH_TOKEN_KEY, data);
  };

  const FED_LOG_OUT = () => {
    SET_USER_INFO({});
    SET_TOKEN("");
    SET_REFRESH_TOKEN("");
    clearInterval(refreshTime.value);
    refreshTime.value = null;
  };

  //实时检测刷新token
  const REFRESH_TOKEN = () => {
    console.log('REFRESH_TOKEN setTokenTime ====> ', setTokenTime);
    if (refreshTime.value) {
      clearInterval(refreshTime.value);
      refreshTime.value = null;
    }
    refreshTime.value = setInterval(() => {
      let date1 = dayjs(setTokenTime);
      let date2 = dayjs();
      const date = date2.diff(date1, "seconds");
      if (validatenull(date)) return;
      if (date >= website.tokenTime && !refreshLock.value) {
        refreshLock.value = true;
        // API 调用已移除 - refreshTokenApi
        // TODO: 需要实现 token 刷新逻辑
        refreshLock.value = false;
        clearInterval(refreshTime.value);
        FED_LOG_OUT();
      }
    }, 1000);
  };

  const setNextPage = (params) => {
    nextPage.value = params;
  };
  const checkReLogin = () => {
    return new Promise((resolve, reject) => { 
      if(hasEffectiveToken.value){
        resolve();
      }else{
        reject();
      }
      // if(setTokenTime && userInfo.value){
      //   let date1 = dayjs(setTokenTime);
      //   let date2 = dayjs();
      //   const date = date2.diff(date1, "seconds");
      //   if(date >= userInfo.value.expires_in){
      //     reject();
      //   }else{
      //     resolve();
      //   }
      // }else{
      //   reject();
      // }
    });
  }
  // 相当于getter
  const hasLogin = computed(() => {
    console.log('hasLogin', userInfo.value);
    return !!userInfo.value.phone;
  });
  // 用户是否有效
  const hasEffectiveToken = computed(() => {
    if(userInfo.value){
      let date1 = dayjs(setTokenTime);
      let date2 = dayjs();
      const date = date2.diff(date1, "seconds");
      return date < userInfo.value.expires_in
    }else{
      return false;
    }
  });

  const isNew = computed(() => {
    return !!userInfo.value.isNew;
  });

  // 积分
  const credit = computed(() => {
    return {
      balance: userInfo.value.balance,
      giftCredit: userInfo.value.giftCredit,
      purchaseCredit: userInfo.value.purchaseCredit,
      vipCredit: userInfo.value.vipCredit,
    };
  });


  // 相当于getter
  const phone = computed(() => {
    // console.log(1111);
    if (userInfo.value.phone) {
      return userInfo.value.phone;
    } else {
      return "";
    }
  });

  return {
    token,
    phone,
    userInfo,
    hasLogin,
    nextPage,
    credit,
    hasEffectiveToken,
    isNew,
    SET_TOKEN,
    SET_USER_INFO,
    FED_LOG_OUT,
    REFRESH_TOKEN,
    SET_REFRESH_TOKEN,
    UPDATA_USER_INFO,
    setNextPage,
    checkReLogin
  };
});
