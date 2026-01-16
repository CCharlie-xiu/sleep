# 📦 uni-app iOS / Android 应用评分 & 应用市场插件

一个用于 **uni-app** 的评分和应用市场跳转插件，支持：

- iOS 系统评分弹窗（SKStoreReviewController）
- 跳转到 App Store 评论页
- Android 多应用市场轮询打开应用详情页或评分页
- 跨平台统一调用接口

> ⚠️ 该插件不仅可以让用户对应用进行评论，也可以直接打开应用市场，用于引导用户查看应用详情、评分或下载更新。

---

## 🚀 安装

将 `uni_modules/dh-store-review` 放入项目中即可，无需额外依赖。

---

## 📖 使用方法

```js
import { iosRequestReview, openAppstore, review } from '@/uni_modules/dh-store-review/index.js';

// iOS 系统评分弹窗
iosRequestReview();

// 跳转到 App Store / Android 应用市场（可用于评论或查看应用）
openAppstore({
  iosAppId: '1234567890',
  androidPkg: 'com.example.app',
  action: 'write-review', // 可选值，ios设置为write-review，可以打开应用市场评论
});

// 通用评分方法，优先iOS应用内评分，不可用则跳转 App Store/安卓市场
review({
  iosAppId: '1234567890',
  androidPkg: 'com.example.app',
});
```

---

## 🔑 API 说明

### `iosRequestReview()`

触发 **iOS 系统评分弹窗**（仅 iOS 平台可用）。

- 系统会根据 Apple 规则决定是否显示弹窗。
- Apple 规定同一用户一年最多显示 3 次。

---

### `openAppstore(options)`

跳转 **App Store 或 Android 应用市场**，既可以用于评论，也可以查看应用详情。

**参数说明：**

| 参数名     | 类型   | 必填 | 说明                                                                     |
| ---------- | ------ | ---- | ------------------------------------------------------------------------ |
| iosAppId   | String | 否   | iOS App Store 应用 ID                                                    |
| androidPkg | String | 否   | Android 应用包名（轮询市场）                                             |
| action     | String | 否   | iOS 官方支持的 action，推荐使用 `'write-review'`，可选留空打开应用详情页 |

> Android 会尝试当前设备安装的应用市场，如果都未安装，会 fallback 到网页。

---

## 📌 特点

- **跨平台**：同时支持 iOS 和 Android
- **Android 多市场兼容**：轮询常见应用市场，优先打开默认渠道
- **功能多样**：不仅评分，还能打开应用市场查看应用详情
- **独立函数封装**：按需导入，不依赖统一对象

---

## 🛠 插件目录结构

```
uni_modules/
 └── dh-store-review/
      ├── package.json
      ├── index.js
      └── readme.md
```

---

## 📜 License

MIT
