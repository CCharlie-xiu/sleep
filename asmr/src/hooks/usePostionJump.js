import { url2obj, isHttpOrs } from "@/common/utils/util.js";
import { categoryCodeEnum } from "@/common/data/enum.js";
export default function () {
  const { proxy } = getCurrentInstance();
  
  const handleJump = (positionData) => {
    // targetType 1 内部 2 外部
    let targetUrl, isJumpWebview;
    if (typeof positionData === "object") {
      targetUrl = decodeURIComponent(
        typeof positionData === "object" ? positionData.targetUrl : positionData
      );
      isJumpWebview = positionData.targetType == 2 || isHttpOrs(targetUrl);
      // 埋点调用已移除 - $trackUp
    } else {
      targetUrl = decodeURIComponent(positionData);
      isJumpWebview = isHttpOrs(targetUrl);
    }

    if (!isJumpWebview) {
      const urlSplit = targetUrl.split("?");
      const path = urlSplit[0];
      const query = url2obj(targetUrl);
      const page = proxy.$Router.getRoute();
      const isCurrentPage = path.indexOf(page.route) > -1;

      if (isCurrentPage) {
        uni.$emit("positionJump", query);
      } else {
          let method = "push";
          if (path.indexOf("/pages/index/index") > -1) {
            method = "replaceAll";
          }
          proxy.$Router[method](path, {
            query,
          });
      }
    } else {
      proxy.$Router.push("/indexPages/common/webview", {
        query: {
          url: targetUrl,
        },
      });
    }
  };

  const handleToAnswerPage = (agreementCode) => {
    const categoryCode = categoryCodeEnum[agreementCode];
    if (!categoryCode) return false;

    const params = {
      agreementCode: agreementCode,
      categoryCode: categoryCode,
    };

    proxy.$Router.push("/minePages/answer/answer", { query: params });
  };

  return {
    handleJump,
    handleToAnswerPage,
  };
}
