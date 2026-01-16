// import { v4 as uuidv4 } from "uuid";
import { isWebPSupported } from "./canWebp";

// 电话加密转换
const phoneEncrypt = function (phone) {
	if (!phone) return
	return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 校验电话格式
const checkPhone = (phone) => {
	const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
	return reg.test(phone);
}

// 进行渐变色替换
const replaceGradualColor = (colorStr) => {
	if (typeof colorStr !== 'string') return colorStr;
	const gradualStr = 'linear-gradient($, $)';
	const reg = /(\$+)\s*,\s*(\$+)/;
	const colorArr = colorStr.split(',');
	return colorArr.length > 1 ? gradualStr.replace(reg, `${colorArr[0]}, ${colorArr[1]}`) : colorStr;
}

// md5加密
// import jsmd5 from 'js-md5'
const md5 = (str) => {
	if (!str) return str
	if (str.search(/^[a-z0-9]{32}$/ig) == 0) return str
	return jsmd5(str)
}

// 是否是http或者https
const isHttpOrs = (str) => {
	return /^(http|https):\/\//.test(str)
}
// 是http
const isHttp = (str) => {
	return /^(http):\/\//.test(str)
}

const delayPromise = (ms) => {
	return new Promise((resolve, reject) => {
		setTimeout(reject, ms);
	});
}

/*
Promise 超时机制
 */
const promiseTimeOut = (promise, ms = 5000, sign = '') => {
	var timeout = delayPromise(ms).catch(() => {
		throw new Error('Operation timed out after ' + ms + ' ms' + ' in ' + sign);
	});

	return Promise.race([timeout, promise])
}

// import { CryptoJS, loadJs as loadjs, validatenull as vanull } from 'kfUtilJs'

export const validatenull = (val) => {
	if (typeof val === "boolean") {
		return false;
	}
	if (typeof val === "number") {
		return false;
	}
	if (val instanceof Array) {
		if (val.length === 0) return true;
	} else if (val instanceof Object) {
		if (JSON.stringify(val) === "{}") return true;
	} else {
		if (val === "null" || val == null || val === "undefined" || val === undefined || val === "") return true;
		return false;
	}
	return false;
}

/**
 * 校验手机号
 * @param {*} val 手机号
 * @returns 
 */
export const validatePhone = val => {
	return /^1[3-9]\d{9}$/.test(val)
}

const decrypt = (data) => {
	const SECRET_KEY = CryptoJS.enc.Utf8.parse("qwrtyuiqwrtyui");
	const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
	const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
		iv: SECRET_KEY,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
	return decryptedStr.toString();
}



// #ifdef H5
// 获取url参数
export const getUrlParam = (name) => {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [,
		""
	])[1].replace(/\+/g, '%20')) || null
}
// #endif

/**
 * 16进制颜色字符串解析为颜色对象
 * @param color 颜色字符串
 * @returns IColorObj
 */
export const parseHexColor = (color) => {
	let hex = color.slice(1);
	let a = 1;
	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}
	if (hex.length === 8) {
		a = parseInt(hex.slice(6), 16) / 255;
		hex = hex.slice(0, 6);
	}
	const bigint = parseInt(hex, 16);
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255,
		a,
	};
};

/**
 * 颜色字符串解析为颜色对象
 * @param color 颜色字符串
 * @returns IColorObj
 */
export const parseColorString = (color) => {
	if (color.startsWith('#')) {
		return parseHexColor(color);
	}
	throw new Error(`color string error: ${color}`);
};
/**
 * 颜色对象转化为rgb颜色字符串
 * @param colorObj 颜色对象
 */
export const toRgbString = (colorObj) => {
	const { r, g, b } = colorObj;
	return `${r},${g},${b}`;
};
/**
 * 16进制颜色字符串转化为rgb颜色字符串
 * @param hex 16进制颜色字符串
 * @returns rgb颜色字符串
 */
export const hexToRgb = (hex) => {
	const colorObj = parseColorString(hex);
	return toRgbString(colorObj);
};

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
export function generateTraceId() {
	return generateUUID().replace(/-/g, ""); // Remove dashes for B3 format
}

export function generateSpanId() {
	return generateUUID().replace(/-/g, "").substring(0, 16); // Span ID is typically 8 bytes
}

export function generateB3Header(traceId = generateTraceId(), spanId = generateSpanId(), parentSpanId = "", sampled = "1") {
	return `${traceId}-${spanId}-${sampled}-${parentSpanId}`;
}

// 对象转化为url参数
export function obj2url(obj) {
	let str = "";
	for (const i in obj) {
		str += `&${i}=${obj[i]}`;
	}
	if (str) str = str.substring(1);
	return str;
}
/**
 * 将URL参数字符串解析为对象
 * @param {string} urlStr - 完整的URL或参数字符串（可包含问号）
 * @returns {Object} 解析后的参数对象
 */
export const url2obj = (urlStr) => {
	urlStr = decodeURIComponent(urlStr);
	// 提取问号后的参数字符串
	const queryString = urlStr.includes('?')
		? urlStr.split('?')[1]
		: urlStr;

	return queryString.split('&').reduce((acc, pair) => {
		const [key, value = ''] = pair.split('=');
		if (key) {
			// 解码URI组件并处理数组参数
			const decodedKey = decodeURIComponent(key);
			const decodedValue = decodeURIComponent(value);

			// 处理数组参数 (如: key[]=1)
			if (decodedKey.endsWith('[]')) {
				const cleanKey = decodedKey.slice(0, -2);
				acc[cleanKey] = acc[cleanKey] || [];
				acc[cleanKey].push(decodedValue);
			}
			// 处理重复参数 (后出现的覆盖前者)
			else {
				acc[decodedKey] = decodedValue;
			}
		}
		return acc;
	}, {});
};

// 单位转换函数
export const convertUnit = (value, sacle = 1.5) => {
	if (typeof value === 'number') {
		return Math.max(1, Math.floor(value)); // 数字直接取整
	}

	const match = String(value).match(/^(\d+(?:\.\d+)?)(px|rpx|%)$/);
	if (!match) return value;

	const [, numStr, unit] = match;
	const num = parseFloat(numStr);

	// 单位转换逻辑
	switch (unit) {
		case 'px':  // px直接取整
		case 'rpx':
			return Math.max(1, Math.floor(num * sacle));
		case '%':
			// 百分比转换为OSS支持的p后缀格式
			return `${Math.max(1, Math.min(100, num))}p`;
		default:
			return value;
	}
};

let canWebp;
isWebPSupported().then(result => {
	canWebp = result;
})

export const ossResizeUrl = ({
	url,
	width,
	height
}) => {
	if (!url || url.endsWith('.svg')) return url;

	// 构建OSS处理参数
	const params = [];
	if (width) {
		params.push(`w_${convertUnit(width)}`);
	}
	if (height) {
		params.push(`h_${convertUnit(height)}`);
	}

	let ossProcess = '';
	if (params.length > 0){
		ossProcess = `image/resize,${params.join(',')}`;
	}
	canWebp && !url.endsWith('.gif') && (ossProcess += (params.length > 0 ? '/' : 'image/') +  'format,webp')
	try {
		const parsedUrl = new URL(url);
		parsedUrl.searchParams.append('x-oss-process', ossProcess);
		return decodeURIComponent(parsedUrl.toString());
	} catch {
		// 回退方案
		return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=${ossProcess}`;
	}
}

export const trim = (str) => {
	if (typeof str !== 'string') {
		return str;
	}

	let start = 0;
	let end = str.length - 1;

	// 去除开头的空格
	while (start <= end && /\s/.test(str[start])) {
		start++;
	}

	// 去除结尾的空格
	while (end >= start && /\s/.test(str[end])) {
		end--;
	}

	return str.slice(start, end + 1);
};


import JSEncrypt from "jsencrypt"
/**
 * RSA加密 + Base64 URL安全编码
 * @param {string} text 待加密的明文
 * @returns {string|null} URL安全的密文
 */
export const rsaEncrypt = (text) => {
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwNMLN27V/MSmj1kk/sId
SHlj49dBT7fFslPNdRJon7aB7kvM71C6MkqptL2sfn+dTeRPDwo3t80mnb5dhkn5
60aX+iOr2NqmtDPbXyp/I43glPln9aJ7Z4NU6FaHX/w/o8CVf7f9wxUfmlG7UX51
I/6kE+FUC80//0o2NcShTW4KxKXp6wtLugE9mzuB8T5BUE944tvSUdunJDxRlv0M
V9NeL3CPPk4GFHMNYIKXHGKFtxpwC/biVSMtfbSIvX4dXmC1C5sPDMbuhP0JVkVo
Gs1cG9uAXBMGk7aLTJQ3ReUtWLxxgF8kPjAni64cwFAGifViMOgzuz0u6NxbQjSB
cwIDAQAB
-----END PUBLIC KEY-----`

  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(text)

  if (!encrypted) {
    console.error("[RSA Encrypt] 加密失败，可能是公钥格式错误或明文过长")
    return null
  }

  // Base64 → URL Safe Base64
  const urlSafe = encrypted
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
	// console.log('urlSafe',urlSafe)
  return urlSafe
}


/**
 * @typedef {Object} KeychainPlugin
 * @property {(key: string, value: string) => Promise<Object>} set 保存键值对
 * @property {(key: string) => Promise<Object>} get 获取键值对
 * @property {(key: string) => Promise<Object>} delete 删除键值对
 */

// #ifdef APP-PLUS
const plug = uni.requireNativePlugin("Html5app-KeyChain")
const service = "com.kuaifuinfo.funplay"

/** @type {KeychainPlugin} */
export const keychainPlus = {
  /**
   * 设置值
   */
  set(key, value) {
    return new Promise((resolve) => {
      plug.saveValue({ key, value, service }, (ret) => {
        console.log("[Keychain.set] 返回:", ret)
        resolve(ret)
      })
    })
  },

  /**
   * 获取值
   */
  get(key) {
    return new Promise((resolve) => {
      plug.selectKey({ key, service }, (ret) => {
        console.log("[Keychain.get] 返回:", ret)
        resolve(ret)
      })
    })
  },

  /**
   * 删除值
   */
  delete(key) {
    return new Promise((resolve) => {
      plug.deleteKey({ key, service }, (ret) => {
        console.log("[Keychain.delete] 返回:", ret)
        resolve(ret)
      })
    })
  },
}
// #endif


export {
	phoneEncrypt,
	checkPhone,
	replaceGradualColor,
	md5,
	isHttpOrs,
	isHttp,
	promiseTimeOut,
	decrypt,
}
