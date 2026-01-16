import { onMounted, ref } from "vue";
import { useaAppConfigStore } from "@/store/appConfig";
import { initLogin, initMemberInfo } from "@/common/initModule/mpInit.js";

/**
 * 支付流程Hooks
 */
export default function usePayment() {
  const { proxy } = getCurrentInstance();
  const { config } = storeToRefs(useaAppConfigStore());
  const orderId = ref("");
  const payOrderId = ref("");
  const payErrTipModal = ref(false);
  const payClose = ref(false);
  const isPaying = ref(false);

  // 查询计数器
  let queryNum = 0;
  /**
   * 查询可选支付方式
   */
  const payConfig = ref([]); //可选支付方式列表
  const getPayConfig = async (pageNo, pageSize, params = {}) => {
    try {
      const res = await API.listPayConfigByOwnClient(pageNo, pageSize, {
        ...params,
      });
      const { records = [] } = res.data.listPayConfigByOwnClient || {};
      payConfig.value = records;
      console.log('payConfig.value===============',payConfig.value);
    } catch (err) {
      throw err;
    }
  };

  /**
   * 获取对应的支付方式 [更新调用方案 映射表]
   */

  const getPayCode = () => {
    if (!payConfig.value.length) {
      proxy.$Tips.toast("暂无可用支付方式");
      return;
    }
    let payMap = {};

    // #ifdef MP-TOUTIAO
    payMap = { code: "DY_APP_PAY" };
    // #endif

    // #ifdef MP-WEIXIN
    payMap = { code: "WX_JSAPI_PAY" };
    // #endif

    // #ifdef APP-PLUS
    payMap = { code: "APPLE_IPA_PAY" };
    // #endif

    // #ifdef MP-KUAISHOU
    payMap = { code: "KS_APP_PAY" };
    // #endif

    // 查找支付方式
    const payItem = payConfig.value.find(
      (item) => item.payCode === payMap.code
    );
    if (payItem) {
      return payItem.payCode;
    } else {
      proxy.$Tips.toast("暂无可用支付方式");
    }
  };


  /**
   * 发起支付
   * @param {Function} param - 获取支付参数的方法
   */
  const recharge = async (value) => {
    // #ifndef APP-PLUS
    const { apiName, param } = value;
    payClose.value = false;
    isPaying.value = true;
    proxy.$Tips.loading();
    try {
      const res = await API[apiName](param);
      const { record } = res.data[apiName];
      const payInfo = record.payInfo;
      // 已支付过
      if (payInfo.success) {
        proxy.$Tips.loaded();
        isPaying.value = false;
        uni.$emit("payedCall");
        return;
      }
      orderId.value = record.orderId;
      payOrderId.value = payInfo.payOrderId;
      const payParams = payInfo.payParams.reduce((acc, data) => {
        if (data.value !== "") {
          acc[data.key] = data.value;
        }
        return acc;
      }, {});
      let params = {};
      // #ifndef APP-PLUS
      if (payInfo.payCode === "DY_APP_PAY") {
        params = {
          orderInfo: payParams,
          service: 5,
        };
      } else if (payInfo.payCode === "WX_JSAPI_PAY") {
        params = {
          ...payParams,
          service: 5,
        };
      } else if (payInfo.payCode === "KS_APP_PAY") {
        params = {
          orderInfo: payParams,
          service: "1",
          paymentChannel: JSON.parse(config.value.paymentChannel)
        };
      }
      // #endif
      console.log("params", params);

      uni.requestPayment({
        ...params,
        success: async (sucRes) => {
          // #ifdef MP-TOUTIAO
          // 抖音小程序支付结果处理
          // 抖音小程序支付调用
          if (sucRes.code !== 0) {
            proxy.$Tips.loaded();
            proxy.$Tips.toast("支付失败！");
            isPaying.value = false;
            return;
          }
          // #endif
          console.debug("支付成功", sucRes);
          await checkOrderNo();
        },
        fail: (err) => {
          console.log("err", err);

          proxy.$Tips.loaded();
          payClose.value = true;
          isPaying.value = false;
          console.debug("支付失败", err);
          uni.$emit("payFailCall", err);
        },
      });
    } catch (err) {
      proxy.$Tips.loaded();
      isPaying.value = false;
      if (err.data?.msg && err.data.msg.includes("登录")) {
        setTimeout(() => {
          initLogin().then(() => {
            recharge(value);
          });
        }, 1000);
      } else {
        proxy.$Tips.toast(err.data?.msg || "支付失败");
      }
      uni.$emit("payFailCall", err);
    }
    // #endif
  };

  /**
   * 检查支付状态
   */
  const checkOrderNo = async () => {
    proxy.$Tips.loaded();
    proxy.$Tips.loading("查询支付状态中...");
    for (let i = 0; i < 3; i++) {
      try {
        const payRes = await new Promise((resolve) => {
          setTimeout(async () => {
            const res = await API["queryPayOrder"]({
              id: payOrderId.value,
            });
            resolve(res);
          }, 1000);
        });
        const { record } = payRes.data["queryPayOrder"];
        if (record && record.status === "success") {
          proxy.$Tips.loaded();
          isPaying.value = false;
          uni.$emit("paySuccCall");
          initMemberInfo();
          queryNum = 0;
          // #ifdef MP-WEIXIN
          proxy.$Tips.toast("支付成功！");
          // #endif
          return;
        } else {
          showPayErrTip();
        }
      } catch (err) {
        console.log("订单查询错误", err);
        showPayErrTip();
      }
    }
  };

  /**
   * 显示支付错误提示
   */
  const showPayErrTip = () => {
    queryNum++;
    if (queryNum >= 3) {
      proxy.$Tips.loaded();
      payErrTipModal.value = true;
      isPaying.value = false;
      queryNum = 0;
    }
  };

  onMounted(() => {
    getPayConfig(1, 99);
  });

  return {
    orderId,
    payErrTipModal,
    payClose,
    isPaying,
    payConfig,
    getPayConfig,
    recharge,
    checkOrderNo,
    showPayErrTip,
    getPayCode,
  };
}
