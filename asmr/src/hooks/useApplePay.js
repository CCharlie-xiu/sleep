/**
 * APPLE 支付流程Hooks
 */
// API 调用已移除 - pay API
// 获取支付通道
function getPaymentProviders() {
  return new Promise((resolve) => {
    uni.getProvider({
      service: "payment",
      success: (res) => resolve(res.provider),
      fail: (err) => {
        console.log("获取支付通道失败:", err);
        resolve([]);
      },
    });
  });
}

// 获取 iapChannel
function getIapChannel() {
  return new Promise((resolve) => {
    plus.payment.getChannels(
      (res) => {
        const iap = res.find((ch) => ch.id === "appleiap");
        resolve(iap || null);
      },
      (err) => {
        console.log("获取 iapChannel 失败:", err);
        resolve(null);
      }
    );
  });
}

// 请求商品信息
function requestIapProduct(iapChannel, productId) {
  return new Promise((resolve) => {
    iapChannel.requestProduct(
      [productId],
      (res) => {
        console.log("商品信息:", res);
        resolve(res);
      },
      (err) => {
        console.log("请求商品信息失败:", err);
        resolve(null);
      }
    );
  });
}

// 拉起支付
function requestApplePayment(productId) {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: "appleiap",
      orderInfo: {
        productid: productId,
        manualFinishTransaction: true,
      },
      success: resolve,
      fail: reject,
    });
  });
}

// 关闭当前订单,去除loading
function closeReceipt(iap, payRes, proxy) {
  return new Promise((resolve, reject) => {
    try {
      if (iap && iap.finishTransaction) {
        // finishTransaction 有回调
        iap.finishTransaction(
          payRes,
          () => {
            console.log("交易完成 ✅");
            proxy.$Tips.loaded();
            resolve(true);
          },
          (err) => {
            console.error("关闭订单失败 ❌", err);
            proxy.$Tips.loaded();
            reject(err);
          }
        );
      } else {
        proxy.$Tips.loaded();
        resolve(false);
      }
    } catch (err) {
      proxy.$Tips.loaded();
      reject(err);
    }
  });
}

// 支付完成后，清理残留交易
async function clearTransactions(iap) {
  if (!iap || !iap.restoreComplateRequest) return;
  return new Promise((resolve) => {
    iap.restoreComplateRequest((transactions) => {
      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        console.log("没有残留交易需要清理");
        resolve();
        return;
      }
      let count = 0;
      transactions.forEach((tx) => {
        if (iap.finishTransaction) {
          iap.finishTransaction(
            tx,
            () => {
              count++;
              if (count === transactions.length) resolve();
            },
            (err) => {
              console.log("清理交易失败", err);
              count++;
              if (count === transactions.length) resolve();
            }
          );
        } else {
          count++;
          if (count === transactions.length) resolve();
        }
      });
    });
  });
}

/* 引用示例 
const { getPayCode } = usePayment();
startIapFlow({
  productId: dataList.value[current.value].externalRefId,
  skuId: dataList.value[current.value].skuId,
  getPayCode,
  initMemberInfo
}) */
// getPayCode, initMemberInfo 传递函数本身
export function useIapPayment() {
  const { proxy } = getCurrentInstance();
  async function startIapFlow({
    productId,
    skuId,
    getPayCode,
    initMemberInfo,
  }) {
    let PAYORDRERID = "";

    try {
      // proxy.$Tips.toast("正在拉起支付窗口");
      proxy.$Tips.loading();
      console.log("[startIapFlow] 入参:", { productId, skuId });

      // 1. 获取支付通道
      const providers = await getPaymentProviders();
      // console.log("[getPaymentProviders] providers:", providers);
      if (!providers.includes("appleiap")) throw new Error("找不到 appleiap");

      // 2. 获取 iapChannel
      const iapChannel = await getIapChannel();
      // console.log("[getIapChannel] iapChannel:", iapChannel);
      if (!iapChannel) throw new Error("找不到 iapChannel");

      // 3. 请求商品信息
      const productInfo = await requestIapProduct(iapChannel, productId);
      // console.log("[requestIapProduct] productInfo:", productInfo);
      if (!productInfo) throw new Error("请求商品信息失败");

      // 4. 创建订单
      const orderRes = await API["purchasePlan"]({
        skuId,
        payCode: getPayCode(),
      });
      console.log("[API.purchasePlan] orderRes:", orderRes);
      const { record } = orderRes.data["purchasePlan"];
      PAYORDRERID = record.payInfo.payOrderId;
      /* console.log(
        "[purchasePlan] record:",
        record,
        "PAYORDRERID:",
        PAYORDRERID
      ); */

      // 5. 拉起支付
      proxy.$Tips.toast("拉起支付中...");
      const payRes = await requestApplePayment(productId);
      // console.log("[requestApplePayment] payRes:", payRes);
      if (!payRes || !(payRes.transactionReceipt || payRes.receiptData)) {
        closeReceipt(iapChannel, payRes, proxy);
        throw new Error("支付未完成或用户取消");
      }

      // 支付票据，用于在开发者的服务器向苹果的服务器二次验证交易是否有效
      const RECEIPTDATA = payRes.transactionReceipt || payRes.receiptData;
      // console.log("[支付成功] RECEIPTDATA:", RECEIPTDATA);

      // 苹果交易支付ID
      const IDENTIFIER = payRes.transactionIdentifier;

      // 6. 服务端验证
      let DISPLAYCONTENT = { "receipt-data": RECEIPTDATA };
      // console.log("[verifyAppleOrder 入参]:", { id: PAYORDRERID,displayContent: DISPLAYCONTENT,});

      /*const verifyRes = await API["verifyAppleOrder"]({
        id: PAYORDRERID,
        displayContent: JSON.stringify(DISPLAYCONTENT),
      }); */
      try {
        const verifyRes = await API["queryPayOrder"]({
          id: PAYORDRERID,
          channelOrderNo: IDENTIFIER,
        });
        console.log("[API.verifyAppleOrder] verifyRes:", verifyRes);

        const { record: verifyRecord } = verifyRes.data["queryPayOrder"] || {};
        proxy?.$Tips?.toast("支付结果确认中");
        console.log("[verifyAppleOrder] verifyRecord:", verifyRecord);

        if (verifyRecord && verifyRecord.status === "success") {
          try {
            await closeReceipt(iapChannel, payRes, proxy);
          } catch (err) {
            console.error("[closeReceipt] 出错:", err);
          }
          uni.$emit("paySuccCall");
          try {
            initMemberInfo && (await initMemberInfo());
            console.log("[initMemberInfo] 执行完毕");
          } catch (err) {
            console.error("[initMemberInfo] 出错:", err);
          }
          proxy?.$Tips?.toast("您已成功订购");
        } else {
          try {
            await closeReceipt(iapChannel, payRes, proxy);
          } catch (err) {
            console.error("[closeReceipt] 出错:", err);
          }
          uni.$emit("paySuccCall");
          try {
            initMemberInfo && (await initMemberInfo());
          } catch (err) {
            console.error("[initMemberInfo] 出错:", err);
          }
          console.warn("[支付失败] verifyRecord.status !== success");
          proxy?.$Tips?.toast("即刻核对账单，权益马上到账");
        }
      } catch (err) {
        try {
          await closeReceipt(iapChannel, payRes, proxy);
        } catch (err) {
          console.error("[closeReceipt] 出错:", err);
        }
        console.error("[支付结果确认流程] 出错:", err);
        proxy?.$Tips?.toast("支付结果确认失败，请稍后重试");
      }
    } catch (err) {
      proxy.$Tips.loaded();
      initMemberInfo && initMemberInfo();
      console.error("[支付流程异常]:", err);
      proxy.$Tips.toast(err.message || "支付失败");
    }
  }

  return {
    startIapFlow,
  };
}
