# 娇森微商城 🧩

基于 Vite + Vue3 + uni-app + unocss 的跨端应用模板，支持 H5/小程序/App 多端发布。

## 🚀 技术栈

- **前端框架**: Vue 3 + Composition API + uniapp + unocss
- **构建工具**: Vite 5
- **UI 组件库**: [tuniaoui-vue3](https://vue3.tuniaokj.com/doc/component/icon.html) (通过 uni_modules 引入)
- **列表组件**: [z-paging](https://z-paging.zxlee.cn/start/intro.html)
- **网络请求**: [luch-request](https://ext.dcloud.net.cn/plugin?id=392)
- **状态管理**: Pinia
- **路由拦截**: [uni-crazy-router](https://ext.dcloud.net.cn/plugin?id=1658)
- **CSS原子化**: [unocss](https://ext.dcloud.net.cn/plugin?id=17509)

## 环境准备

确保已安装：

- Node.js ≥ 18.x
- npm ≥ 9.x

## 项目初始化

```bash
# 安装依赖
npm i
# 启动项目
npm run dev-wx # 根据命令执行
```


## 📁 目录结构
```bash
├── src/
│   ├── api/            # 请求接口列表
│   │   ├── graphql/    # gql协议接口模块
│   │   ├── restful/    # restful协议接口模块
│   ├── common/         # 通用文件
│   │   ├── ad/           # 广告管理模块
│   │   ├── data/         # 数据存放
│   │   ├── utils/        # 工具库
│   │   ├── initModule/   # 初始化模块
│   │   ├── luch-request/ # 请求服务第三方插件
│   │   ├── plugins/      # main.ts 挂载的插件&mixin
│   │   └── service/      # 请求服务封装
│   │   ├── sse/          # sse 服务封装
│   │   ├── track/        # 埋点上报封装
│   │   └── utils/        # 工具库
│   ├── components/     # 组件
│   ├── hooks/          # 公共复用hooks
│   ├── indexPages/     # 首页模块分包
│   ├── minePages/      # 我的模块分包
│   ├── pages/          # 主包页面
│   ├── playPages/      # 玩法模块分包
│   ├── router/         # 路由守卫管理
│   ├── static/         # 静态资源
│   ├── store/          # Pinia 状态管理
│   ├── styles/         # 公共样式
│   ├── uni_modules/    # uni-app 插件库 (含 tuniaoui-vue3, z-paging)
│   ├── App.vue         # 页面入口
│   ├── main.ts         # 项目入口
│   ├── manifest.json   # 应用配置
│   ├── pages.json      # 页面路由
│   └── uni.scss        # 全局scss变量管理
├── .env                # 公共环境变量配置(一般用于开发环境)
├── .env.h5             # h5开发环境变量配置
├── .env.production     # 小程序生产环境变量配置
├── .env.test           # 小程序测试环境变量配置
├── .env.uat            # 小程序预发环境变量配置
├── .env.ios.production # ios app生产环境变量配置
├── .env.ios.test       # ios app测试环境变量配置
├── .env.ios.uat        # ios app预发环境变量配置
├── build.js            # 自定义打包运行脚本
├── package.json        # 依赖配置
├── vite.config.ts      # Vite 配置
└── index.html          # HTML 模板
```

## 内置样式
### ui框架集成 (https://vue3.tuniaokj.com/doc/guide/style/color.html)
### 自定义集成 均在/src/styles/common.scss

## 路由跳转
```html

// 使用编程式调用
// 全局挂载至 globalProperties.$Router
<template>
  <button @click="$Router.push('path', params)"></button>
</template>

<!-- compsition api -->
<script setup>
  const { proxy } = getCurrentInstance();
  // 获取路由传参
  proxy.$Router.getRouterParams()
</script>

```

## 埋点上报
```html
<!-- 主动触发 -->
<template>
  <view
  <!-- 标记点击埋点 -->
  :data-track-click="{
    <!-- 填入需要上报的属性 -->
  }"
  <!-- 标记曝光埋点 -->
  :data-track-exposure="{
    <!-- 填入需要上报的属性 -->
  }"
  >


  </view>

</template>
<!-- compsition api -->
<script setup>
  const { proxy } = getCurrentInstance();
  // 入侵业务代码埋点
  // 事件code必填  入参 为可选参数
  proxy.$trackUp('eventCode', 'params')
</script>

```
