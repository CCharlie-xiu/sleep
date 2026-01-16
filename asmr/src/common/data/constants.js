// vuex 传参 比router的params能穿更多参数 并且持久化
const VUEX_PARAMS = "vuex_params";
//   grantType: "social",
//   projectId: "0",
//   source: "dy",
// 平台
let PLATFORMENUM = "";
// #ifdef MP-TOUTIAO
PLATFORMENUM = "dy";
// #endif
// #ifdef MP-WEIXIN
PLATFORMENUM = "wx";
// #endif
// #ifdef MP-KUAISHOU
PLATFORMENUM = "ks";
// #endif
// #ifdef MP-ALIPAY
PLATFORMENUM = "zfb";
// #endif
// #ifdef APP-PLUS
PLATFORMENUM = "apple";
// #endif
const APP_INFO = "app_info";
const LOGIN_CODE = "login_code";

// 密钥
const SECRETKEY = "R7GfxU2kaph7VNUJ";

// 用户信息
const USER_INFO = "user_info";
const USER_TOKEN = "user_token";
const USER_REFRESH_TOKEN = "user_refresh_token";
const SET_TOKEN_TIME = "user_set_token_time";
const REFRESH_TOKEN = 'user_refresh_token';

// 用户协议
const USER_AGREEMENT = "user_agreement";

// 未登录/过期的返回描述合集
const NOT_LOGIN_MSG = ["token已过期，请重新登录", "用户未登录"];

const website = {
  tenantId: import.meta.env.VITE_APP_TENANT_ID,
  tokenHeader: "Blade-Auth",
  tokenTime: 3000,
  scope: 'all', //登录统一参数
  // http的status默认放行不才用统一处理的,
  statusWhiteList: [],
};

// 搜索历史
const SEARCH_HISTORY = "search_history";

// 应用全局配置
const APP_CONFIG = "app_config";

// 需要登录的路由路径
const HAS_LOGIN_ROUTE_PATH = [
  // 创作记录
  'minePages/create-record/create-record', 
  // 会员信息
  'minePages/userInfo/userInfo',
  // 创作页
  'playPages/index/index',
  // #ifdef APP-PLUS
  // 会员订阅
  // 'minePages/goods/member',
  // 积分购买
  // 'minePages/goods/points',
  // 消费订单
  // 'minePages/goods/order',
  // #endif
];

// 是否是首次打开app 1是 0否
const JUDGE_IS_FIRST_LAUNCH = "judge_is_first_launch";

// 当次是否购买会员
const IS_BUY_MEMBER = "is_buy_member";

// 存储创作中的记录队列
const SAVE_CREATE_RECORD_LIST = "save_create_record_list";

// 不需要显示创作中的路由
const NO_SHOW_CREATE_ROUTE_PATH = [
  // 创作预览页
  'playPages/preview/preview',
  // 创作页
  'playPages/index/index',
  // 创作记录
  'minePages/create-record/create-record', 
  // 创作结果
  'playPages/create-result/create-result'
];

export {
  VUEX_PARAMS,
  PLATFORMENUM,
  APP_INFO,
  LOGIN_CODE,
  SECRETKEY,
  USER_INFO,
  USER_TOKEN,
  USER_REFRESH_TOKEN,
  SET_TOKEN_TIME,
  REFRESH_TOKEN,
  USER_AGREEMENT,
  APP_CONFIG,
  NOT_LOGIN_MSG,
  SEARCH_HISTORY,
  website,
  HAS_LOGIN_ROUTE_PATH,
  JUDGE_IS_FIRST_LAUNCH,
  SAVE_CREATE_RECORD_LIST,
  NO_SHOW_CREATE_ROUTE_PATH,
  IS_BUY_MEMBER
};
