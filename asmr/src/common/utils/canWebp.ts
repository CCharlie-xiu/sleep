/**
 * 跨平台检测WebP支持的工具函数 (优化版)
 */

import {
  systemInfo,
  platform
} from '@/common/data/staticData';

interface WebPSupportResult {
  supported: boolean;
  lossy?: boolean;
  lossless?: boolean;
  alpha?: boolean;
  animation?: boolean;
}

let webpSupportCache: WebPSupportResult | null = null;

/**
 * 检测当前环境是否支持WebP格式（支持Web、小程序、App）
 * @returns Promise<WebPSupportResult> 返回WebP支持情况
 */
async function checkWebPSupport(): Promise<WebPSupportResult> {
  // 使用缓存避免重复检测
  if (webpSupportCache) {
    return webpSupportCache;
  }

  // 判断运行环境
  const platform = getPlatform();
  let result: WebPSupportResult;
  switch (platform) {
    // #ifdef H5
    case 'web':
      result = await checkWebPSupportWeb();
      break;
    // #endif
    // #ifdef MP
    case 'mini-program':
      result = await checkWebPSupportMiniProgram();
      break;
    // #endif
    case 'app':
      result = await checkWebPSupportApp();
      break;
    default:
      result = { supported: false };
  }

  // 缓存结果
  webpSupportCache = result;
  return result;
}

/**
 * 获取当前运行平台
 * @returns 'web' | 'mini-program' | 'app' | 'unknown'
 */
function getPlatform(): 'web' | 'mini-program' | 'app' | 'unknown' {
  // 使用uni-app的条件编译
  // #ifdef H5
  return 'web';
  // #endif

  // #ifdef MP
  return 'mini-program';
  // #endif

  // #ifdef APP
  return 'app';
  // #endif

  // 默认返回未知平台
  return 'unknown';
}

/**
 * Web环境下检测WebP支持
 * @returns Promise<WebPSupportResult>
 */
function checkWebPSupportWeb(): Promise<WebPSupportResult> {
  // #ifdef H5
  
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      if (!canvas.getContext) {
        resolve({ supported: false });
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ supported: false });
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({
          supported: img.width > 0 && img.height > 0
        });
      };
      img.onerror = () => {
        resolve({ supported: false });
      };

      // WebP的测试图片数据
      img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    } catch (err) {
      resolve({ supported: false });
    }
  });
  // #endif
}

/**
 * 小程序环境下检测WebP支持
 * @returns Promise<WebPSupportResult>
 */
function checkWebPSupportMiniProgram(): Promise<WebPSupportResult> {
  // #ifdef MP
  
  return new Promise((resolve) => {
    try {
      // 使用uni.canIUse判断WebP支持
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.canIUse) {
        // @ts-ignore
        if (uni.canIUse('createImage.webp')) {
          resolve({ supported: true });
          return;
        }
      }

      // 获取系统信息进行判断
      // @ts-ignore
      try {
        if (platform === 'ios') {
          // iOS 14+ 支持WebP
          const versionMatch = systemInfo.match(/iOS\s+(\d+)/i);
          if (versionMatch && versionMatch[1]) {
            const version = parseInt(versionMatch[1], 10);
            resolve({ supported: version >= 14 });
            return;
          }
        } else if (platform === 'android') {
          // Android 4.0+ 支持WebP
          const versionMatch = systemInfo.match(/Android\s+(\d+)/i);
          if (versionMatch && versionMatch[1]) {
            const version = parseInt(versionMatch[1], 10);
            resolve({ supported: version >= 4 });
            return;
          }
        }
      } catch (e) {
        // 解析版本号出错时，默认支持
        resolve({ supported: true });
        return;
      }

      // 默认情况
      resolve({ supported: true });
    } catch (err) {
      resolve({ supported: true });
    }
  });
  // #endif

}

/**
 * App环境下检测WebP支持
 * @returns Promise<WebPSupportResult>
 */
function checkWebPSupportApp(): Promise<WebPSupportResult> {
  return new Promise((resolve) => {
    try {
      // 在App环境下，默认支持WebP
      // 因为uni-app在App端使用的是原生WebView，现代Android和iOS都支持WebP
      resolve({ supported: true });
    } catch (err) {
      resolve({ supported: true });
    }
  });
}

/**
 * 简化版WebP支持检测（推荐在uni-app中使用）
 * @returns Promise<boolean>
 */
async function isWebPSupported(): Promise<boolean> {
  const result = await checkWebPSupport();
  return result.supported;
}

// 导出函数
export {
  checkWebPSupport,
  isWebPSupported,
  getPlatform
};