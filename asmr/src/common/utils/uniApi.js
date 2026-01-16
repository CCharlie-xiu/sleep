import Tips from "./tips.js";
import { isHttpOrs, isHttp } from "./util.js";
// 保存图片到相册中
export function savePicture(url) {
  Tips.loading("请稍后...");
  return new Promise((mainResolve, mainReject) => {
    new Promise((resolve, reject) => {
    // #ifdef MP-TOUTIAO
    resolve();
    return;
    // #endif
    // #ifndef MP-ALIPAY || H5 || APP-PLUS
    uni.authorize({
      // #ifdef MP-WEIXIN || MP-KUAISHOU
      scope: "scope.writePhotosAlbum",
      // #endif
      // #ifdef MP-TOUTIAO
      scope: "scope.album",
      // #endif
      success: (e) => {
        resolve();
      },
      fail: (e) => {
        reject();
        Tips.confirm({
          content: "检测到您没打开下载图片功能权限，是否去设置打开？",
          showCancel: true,
        }).then((res) => {
          if (!res) return;
          uni.openSetting({
            success: (sRes) => {},
          });
        });
      },
    });
    // #endif
    // #ifdef MP-ALIPAY || H5 || APP-PLUS
    resolve();
    // #endif
  })
    .then(() => {
      return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN
        // 微信小程序环境下，处理临时文件路径
        if (url.startsWith('wxfile://')) {
          resolve(url);
          return;
        }
        if (url.startsWith('http://tmp/')) {
          // 对于 http://tmp/ 格式的临时文件，使用 getImageInfo 获取真实路径
          uni.getImageInfo({
            src: url,
            success: (res) => {
              resolve(res.path);
            },
            fail: (err) => {
              console.error('getImageInfo failed:', err);
              reject(err);
            }
          });
          return;
        }
        // #endif
        if (isHttpOrs(url)) {
          // 是网络图片
          isHttp(url) && (url = url.replace("http", "https"));
          uni
            .getImageInfo({
              src: url,
            })
            .then((res) => {
              if (Array.isArray(res) && res.length) {
                resolve(res[1].path);
              } else {
                resolve(res.path);
              }
            })
            .catch((er) => {
              reject(er);
            });
        } else {
          resolve(url);
        }
      });
    })
    .then((res) => {
      // #ifndef H5
      uni.saveImageToPhotosAlbum({
        filePath: res,
        success: (e) => {
          Tips.toast("保存图片成功！");
          mainResolve({ success: true, message: "保存图片成功！" });
        },
        fail: (e) => {
          Tips.toast("保存图片失败");
          console.debug(e);
          mainReject({ success: false, message: "保存图片失败", error: e });
        },
      });
      // #endif
      // #ifdef H5
      uni.downloadFile({
        url: res,
        success: () => {
          mainResolve({ success: true, message: "下载图片成功！" });
        },
        fail: (e) => {
          mainReject({ success: false, message: "下载图片失败", error: e });
        }
      });
      // #endif
    })
    .catch((err) => {
      Tips.toast("保存图片失败");
      console.log("downLoad img err", err);
      mainReject({ success: false, message: "保存图片失败", error: err });
    })
    .finally(() => {
      Tips.loaded();
    });
  });
}

// 保存视频到相册中（支持 APP + 小程序 + H5）
export function saveVideo(url) {
  Tips.loading("请稍后...");
  return new Promise((resolve, reject) => {

    // 1️⃣ APP端直接走 plus API
    // #ifdef APP-PLUS
    if (!url) {
      Tips.toast("视频链接为空");
      reject({ success: false, message: "视频链接为空" });
      return;
    }

    // 下载视频到本地
    const dtask = plus.downloader.createDownload(url, {}, (d, status) => {
      if (status === 200) {
        const localPath = d.filename;
        plus.gallery.save(localPath, (path) => {
          Tips.toast("保存视频成功！");
          resolve({ success: true, message: "保存视频成功！", path });
        }, (err) => {
          Tips.toast("保存视频失败！");
          console.error("APP保存失败", err);
          reject({ success: false, message: "保存视频失败！", error: err });
        });
      } else {
        Tips.toast("下载视频失败！");
        reject({ success: false, message: "下载视频失败！", error: status });
      }
    });
    dtask.start();
    return;
    // #endif

    // #ifndef MP-ALIPAY || H5
    // 2️⃣ 小程序端授权
    uni.authorize({
      // #ifdef MP-WEIXIN || MP-KUAISHOU
      scope: "scope.writePhotosAlbum",
      // #endif
      // #ifdef MP-TOUTIAO
      scope: "scope.album",
      // #endif
      success: (e) => {
        resolve();
      },
      fail: (e) => {
        reject();
        Tips.confirm({
          content: "检测到您没打开下载权限，是否去设置打开？",
          showCancel: true,
        }).then((res) => {
          if (!res) return;
          uni.openSetting({});
        });
      },
    });
    // #endif

    // #ifdef MP-ALIPAY
    resolve(); // 支付宝小程序直接走下一步
    // #endif

    // #ifdef H5
    // 3️⃣ H5 直接下载（仅触发浏览器下载）
    resolve();
    // #endif
  })
  .then(() => {
    // 下载网络视频到临时路径
    return new Promise((r, j) => {
      if (isHttpOrs(url)) {
        isHttp(url) && (url = url.replace("http", "https"));
        uni.downloadFile({ url }).then(res => r(res.tempFilePath)).catch(j);
      } else {
        r(url);
      }
    });
  })
  .then((res) => {
    // #ifndef H5
    // 统一保存到相册
    uni.saveVideoToPhotosAlbum({
      filePath: res,
      success: () => {
        Tips.toast("保存视频成功！");
        resolve({ success: true, message: "保存视频成功！" });
      },
      fail: (e) => {
        Tips.toast("保存视频失败!");
        console.error(e);
        reject({ success: false, message: "保存视频失败！", error: e });
      },
    });
    // #endif

    // H5 直接下载
    // #ifdef H5
    const a = document.createElement("a");
    a.href = res;
    a.download = res.split("/").pop();
    a.click();
    resolve({ success: true, message: "已触发浏览器下载" });
    // #endif
  })
  .catch((err) => {
    console.error("downLoad video err", err);
    Tips.toast("保存视频失败");
    reject({ success: false, message: "保存视频失败", error: err });
  })
  .finally(() => {
    Tips.loaded();
  });
}


// 设置导航栏文字和背景颜色
export const changeDefaultNavBar = (title, bgColor, frontColor = "#ffffff") => {
  uni.setNavigationBarColor({
    backgroundColor: bgColor,
    // #ifdef MP-TOUTIAO || MP-KUAISHOU ||MP-WEIXIN
    frontColor,
    // #endif
    complete(e) {
      console.debug("setNavigationBarColor ", e);
    },
  });
  if (title) {
    uni.setNavigationBarTitle({
      title,
      complete(e) {
        console.debug("setNavigationBarTitle ", e);
      },
    });
  }
};
// 设置tabbar某一栏动态显隐
export const changeTabShow = (params) => {
  uni.setTabBarItem({
    ...params,
    complete: (e) => {
      console.debug("changeTabShow", e);
    },
  });
};

// https://uniapp.dcloud.net.cn/api/media/video.html#choosemedia
/**
 *
 * @param {Array} mediaType 默认 ['image'] 可选 ['image', 'video', 'mix']  媒体类型 mix 可同时选择图片和视频 video 选择视频 image 选择图片
 * @param {Array} sourceType 默认 ['album', 'camera'] album	从相册选择 camera	使用相机
 * @param {Number} maxDuration 默认 0 最大时长，单位秒
 * @param {Number} count 默认1 ios不可大于9 最多可以选择的文件个数
 * @param {Array} sizeType 默认 compressed 可选 ['original', 'compressed'] original 原图 compressed 压缩图
 * @returns {Promise}
 */
export const chooseMedia = ({
  mediaType = ["image"],
  sourceType = ["album", "camera"],
  count = 1,
  maxDuration = 3,
  sizeType = ["compressed"],
}) => {
  return new Promise((resolve, reject) => {
    new Promise((r, j) => {
      // #ifndef H5 || MP-TOUTIAO || APP-PLUS
      uni.authorize({
        scope: "scope.camera",
        success: (e) => {
          r();
        },
        fail: (e) => {
          j();
          Tips.confirm({
            content: "检测到您没打开系统相册权限，是否去设置打开？",
            showCancel: true,
          }).then((res) => {
            if (!res) {
            } else {
              uni.openSetting({
                success: (sRes) => {},
              });
            }
          });
        },
      });
      // #endif
      // #ifdef H5 || MP-TOUTIAO || APP-PLUS
      r();
      // #endif
    })
      // #ifndef APP-PLUS
      .then(() => {
        return uni.chooseMedia({
          mediaType,
          sourceType: sourceType,
          count,
          sizeType,
          // #ifndef H5
          maxDuration,
          // #endif
        });
      })
      // #endif
      // #ifdef APP-PLUS
      .then(() => {
        return uni.chooseImage({
          mediaType,
          sourceType: sourceType,
          count,
          sizeType,
          // #ifndef H5
          maxDuration,
          // #endif
        });
      })
      // #endif
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
