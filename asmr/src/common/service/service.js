import Request from "@/common/luch-request";
import configService from "./config.service.js";
import { NOT_LOGIN_MSG, SECRETKEY, website } from "@/common/data/constants.js";
import Tips from "@/common/utils/tips.js";
import {
  validatenull,
  generateB3Header,
  generateTraceId,
  generateSpanId,
} from "@/common/utils/util.js";
// import { encryptDES, decryptDES } from "@/common/utils/crypt.js";
// import codeError from '../data/errcode.js';
import { appID, reLogin } from "@/common/initModule/mpInit.js";
import { useUserStore } from "@/store/user.js";
import { useNetworkStore } from "@/store/network.js";
import { useaAppConfigStore } from "@/store/appConfig";
import { encode } from "js-base64";

// Vue.use(store)
// console.debug(store);

const apiUrl = configService.apiUrl;
const getToken = () => {
  const store = useUserStore();
  let token = "";
  try {
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
  console.log("clientId, clientSecret", clientId, clientSecret);
  return `Basic ${encode(`${clientId}:${clientSecret}`)}`;
};

const http = new Request();
http.setConfig((config) => {
  /* 设置全局配置 */
  config.baseURL = apiUrl; /* 根域名不同 */
  config.header = {
    // #ifdef MP-ALIPAY
    "Content-type": configService.headerContType,
    // #endif
    //安全请求header
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

http.interceptors.request.use(
  (config) => {
    //安全请求header
    config.header["appId"] = appID;
    config.header["b3"] = generateB3Header(
      generateTraceId(),
      generateSpanId(),
      generateSpanId()
    );
    //header判断是否需要
    const authorization = config.authorization === false;
    if (!authorization) {
      config.header["Authorization"] = getBasicAuthToken();
    }
    /* 请求之前拦截器。可以使用async await 做异步操作 */
    console.debug("api", config.url, config.data);
    config.header = {
      ...config.header,
    };
    /**
     * custom {Object} - 自定义参数
     */
    //header判断请求是否携带token
    const meta = config.meta || {};
    const isToken = meta.isToken === false;
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
    if (config.custom.loading) {
      Tips.loading();
    }
    // 监听网络状态
    // config.isConnected =
    //   store.state.networkType && store.state.networkType != "none";
    // if (!config.isConnected) {
    //   return Promise.reject(config);
    // }
    // 加密
    if (
      cryptoData &&
      (!validatenull(config.data) || config.method === "POST")
    ) {
      config.data.appId = appID;
      const jsonData = JSON.stringify(config.data);
      const data = encryptDES(jsonData, SECRETKEY);
      config.data = {
        data,
      };
    }
    return config;
  },
  (config) => {
    return Promise.reject(config);
  }
);

// 必须使用异步函数，注意
http.interceptors.response.use(
  async (res) => {
    /* 请求之后拦截器。可以使用async await 做异步操作  */
    console.debug("res", res.config.fullPath, res);
    if (res.config.custom.loading) {
      Tips.loaded();
    }
    // 网络状态
    // res.isConnected = res.config.isConnected;
    const status = res.data.code || res.statusCode;
    const statusWhiteList = website.statusWhiteList || [];
    const config = res.config;
    const cryptoData = config.cryptoData === true;
    //如果在白名单里则自行catch逻辑处理
    if (statusWhiteList.includes(status)) return Promise.reject(res);
    if (status !== 200) {
      if (status == 401) {
        const hasRelogin = await reLogin();
        if (hasRelogin) {
          return http.request(response.config);
        }
      }
      // 服务端返回的状态码不等于0，则reject()
      typeof status === "undefined" &&
        console.debug("没有code或者 undefined ", res);
      let msg = res.data.msg;
      let resCode = "";
      if (typeof msg === "string") {
        const splitStr = msg.split(":");
        msg = splitStr[1] ? splitStr[1] : msg;
        resCode = splitStr[0];
        res.data.msg = msg;
      }
      return Promise.reject(res);
    }
    // 解密
    if (cryptoData && !validatenull(res.data)) {
      const decryptData = JSON.parse(decryptDES(res.data, SECRETKEY));
      res.data = decryptData.data;
    }
    return res;
  },
  async (response) => {
    // 设置服务器错误状态
    console.log("请求错误", response);
    if (response.config.custom.loading) {
      Tips.loaded();
    }
    const status = (response.data && response.data.code) || response.statusCode;
    if (status == 401) {
      const hasRelogin = await reLogin();
      if (hasRelogin) {
        return http.request(response.config);
      }
    }

    const { networkType } = useNetworkStore();
    if (networkType === "none") {
      Tips.toast("网络异常，请检查网络连接");
      response.isConnected = false;
    } else if (response.errMsg === "request:fail timeout") {
      response.msg = "请求超时,请稍后重试!";
      response.timeout = true;
    }
    return Promise.reject(response);
  }
);

// post 请求
const post = (name, url, datas, custom = {}) => {
  return http.post(
    url,
    { ...datas },
    {
      custom: {
        loading: custom.loading,
      },
    }
  );
};
// get请求
const get = (name, url, datas, custom = {}) => {
  return http.get(
    url,
    { params: datas },
    {
      custom: {
        loading: custom.loading,
      },
    }
  );
};
// 上传文件
const upload = (name, url, datas, custom = {}) => {
  return http.upload(url, {
    ...datas,
    custom: {
      loading: custom.loading,
    },
  });
};

export { post, get, upload };
