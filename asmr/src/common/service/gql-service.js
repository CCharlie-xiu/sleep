import Request from "@/common/luch-request";
import {
  validatenull,
  generateB3Header,
  generateTraceId,
  generateSpanId,
} from "@/common/utils/util.js";
import { encode } from "js-base64";
import configService from "./config.service.js";
import { NOT_LOGIN_MSG, SECRETKEY, website } from "@/common/data/constants.js";
import Tips from "@/common/utils/tips.js";
// import { encryptDES, decryptDES } from "@/common/utils/crypt.js";
import { appID, reLogin } from "@/common/initModule/mpInit.js";
import { useUserStore } from "@/store/user.js";
import { useaAppConfigStore } from "@/store/appConfig";
import { useNetworkStore } from "@/store/network.js";
import { nextTick } from "vue";
// import store from "@/store/user.js";

const apiUrl = configService.apiGqlUrl;
const getToken = () => {
  let token = "";
  try {
    const store = useUserStore();
    token = store.token;
    // console.debug("token", token);
  } catch (e) {
    // TODO handle the exception
    console.debug("getToken", token);
  }
  return token || "";
};

const getBasicAuthToken = () => {
  const { config } = useaAppConfigStore();
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;
  return `Basic ${encode(`${clientId}:${clientSecret}`)}`;
};

const graphqlHttps = new Request();
graphqlHttps.setConfig((config) => {
  /* 设置全局配置 */
  config.baseURL = apiUrl; /* 根域名不同 */
  //   console.debug("apiUrl #debug =======>", apiUrl);
  config.header = {
    // #ifdef MP-ALIPAY
    "Content-type": configService.headerContType,
    // #endif
    "Blade-Requested-With": "BladeHttpRequest",
    "Tenant-Id": website.tenantId,

    ...config.header,
  };
  config.custom = {
    auth: true, // 是否传token
    loading: false, // 是否使用loading
  };
  config.timeout = 30000;
  return config;
});

graphqlHttps.interceptors.request.use(
  (config) => {
    //安全请求header
    config.header["appId"] = appID;
    config.header["b3"] = generateB3Header(
      generateTraceId(),
      generateSpanId(),
      generateSpanId()
    );
    //header判断请求是否携带token
    const custom = config.custom || {};
    //header判断是否需要
    const authorization = custom.authorization === false;
    if (!authorization) {
      config.header["Authorization"] = getBasicAuthToken();
    }
    const isToken = custom.isToken === false;
    //header传递token是否加密
    const cryptoToken = config.cryptoToken === true;
    //判断传递数据是否加密
    const cryptoData = config.cryptoData === true;
    const token = getToken();
    const delArray = ["refresh_token", "captcha", "out_auth_code"];
    if (token && !isToken) {
      if (config.params && delArray.includes(config.params.grant_type)) {
        delete config.header[website.tokenHeader];
      } else {
        config.header[website.tokenHeader] = cryptoToken
          ? "crypto " + crypto.encryptAES(token, crypto.cryptoKey)
          : "bearer " + token;
      }
    }
    // 开启报文加密
    if (cryptoData) {
      config.data.appId = appID;
      const jsonData = JSON.stringify(config.data);
      const data = encryptDES(jsonData, SECRETKEY);
      config.data = {
        data,
      };
    }
    //header中配置text请求
    if (config.text === true) {
      config.header["Content-Type"] = "text/plain";
    }
    //header中配置serialize为true开启序列化
    if (config.method === "post" && custom.isSerialize === true) {
      config.data = serialize(config.data);
    }
    if (custom.loading) {
      Tips.loading();
    }
    return config;
  },
  (config) => {
    return Promise.reject(config);
  }
);

// 必须使用异步函数，注意
graphqlHttps.interceptors.response.use(
  async (response) => {
    const config = response.config;
    const { listNamekey } = config.custom;
    /* 请求之后拦截器。可以使用async await 做异步操作  */
    if (config.custom && config.custom.loading) {
      Tips.loaded();
    }
    // 网络状态
    response.isConnected = response.config.isConnected;
    const errors = (response.data.errors && response.data.errors[0]) || {};
    const status =
      (listNamekey &&
        response.data.data &&
        response.data.data[listNamekey] &&
        response.data.data[listNamekey].code) ||
      (errors.extensions && errors.extensions.code) ||
      response.statusCode;
    let message = (listNamekey &&
      response.data.data &&
      response.data.data[listNamekey] &&
      response.data.data[listNamekey].msg) || response.data.msg || errors.message || "系统错误";
    const cryptoData = config.cryptoData === true;
    if (status == 401 || NOT_LOGIN_MSG.includes(message)) {
      console.log('graphqlHttps 401 ====> reLogin ');
      const hasRelogin = await reLogin();
      if (hasRelogin) {
        return graphqlHttps.request(response.config);
      }
    }
    // console.log('response. log ====> ',  JSON.stringify(errors), JSON.stringify(response.data));
    // 如果请求为非200否者默认统一处理
    if (response.data.errors || status !== 200) {
      const { errors } = response.data;
      if (errors) {
        const errorMessage = errors.find(
          (error) => error.message === "请求被拒绝"
        )?.message;
        if (errorMessage === "请求被拒绝") {
          message = "请求被拒绝";
        }
      }
      // 如果在白名单里则自行catch逻辑处理
      // 是否使用自定义提示，true为使用，false为不使用，默认是false
      if (!config.custom.unUni && status !== 401) {
        Tips.toast(message);
      }
      return Promise.reject(response);
    }
    // 解析加密报文
    if (cryptoData) {
      const decryptData = JSON.parse(decryptDES(response.data, SECRETKEY));
      response.data = decryptData.data;
    }
    // 接口请求成功但是success为false
    const listData = response.data.data[listNamekey];
    if (listData && listData.success == false) {
      // 如果在白名单里则自行catch逻辑处理
      // 是否使用前端自定义提示，true为使用，false为不使用，默认是false
      if (config.custom.unUni) {
        return Promise.reject(response);
      } else {
        if (status !== 401) {
          Tips.toast(listData.msg || "操作失败");
        }
        return Promise.reject(new Error(message));
      }
      // Tips.toast(listData.msg || "操作失败");
      // return Promise.reject(new Error(message));
    }
    // store.state.serverError = false;
    return response.data;
  },
  async (error) => {
    // console.log('response error log ====> ', JSON.stringify(error));
    if (error.config && error.config.custom && error.config.custom.loading) {
      Tips.loaded();
    }
    const { networkType } = useNetworkStore();
    if (networkType === "none") {
      Tips.toast("网络异常，请检查网络连接");
      error.isConnected = false;
    } else if (error.errMsg === "request:fail timeout") {
      error.msg = "请求超时,请稍后重试!";
      error.timeout = true;
    }
    return Promise.reject(error);
  }
);

// gql 请求
export const sendGraph = (datas, custom = {}) => {
  return graphqlHttps.request({
    url: "/ai-bffc/graphql",
    method: "post",
    data: datas,
    custom: {
      ...custom,
    },
  });
};
