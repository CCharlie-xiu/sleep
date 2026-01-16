# laoqianjunzi-appstore

> uni-app 应用内打开AppStore评分 、浏览器打开AppStore应用详情


### 使用介绍
跳转到AppStore评分,有两种方法：
1，通用方式通过App内部打开网页形式，跳转到AppStore编辑评论，可评分，可评论。
优点：方便，快捷，不受系统版本限制，目前最常用的方式。
缺点：内部网页形式加载缓慢，等待时间长，加载失败概率大。

2，iOS 10.0.3 新增应用内评分功能，调用系统方法评分。
优点：无须跳转，应用内系统弹框，方便快速。
缺点：只能评分，且一年只能使用三次弹框。

### 使用示例:
```
<template>
	<view>
		<view class="btn" @click="openAppStore">
			应用内打开AppStore评分
		</view>
		<view class="btn" @click="openAppStoreUrl">
			跳出应用,跳转到AppStore,进行评分
		</view>
	</view>
</template>

<script>
	const app = getApp();

	import {openAppStore,openAppStoreURL} from "@/uni_modules/laoqianjunzi-appstore"

	export default {
		data() {
			return {

			};
		},

		methods: {
			//在应用内,内置AppStore进行评分
			openAppStore() {
				openAppStore({
					success: (res) => {
						console.log('openAppStore-success', res)
					},
					fail: (res) => {
						console.log('openAppStore-fail', res)
					},
					complete: () => {
						console.log('openAppStore-complete')
					},
				})
			},
			//跳出应用,跳转到AppStore,进行评分
			openAppStoreUrl() {
				openAppStoreURL({
					appid:'您的APPID',
					success: (res) => {
						console.log('openAppStoreURL-success', res)
					},
					fail: (res) => {
						console.log('openAppStoreURL-fail', res)
					},
					complete: () => {
						console.log('openAppStoreURL-complete')
					},
				})
			},


		},
	};
</script>
```

2. 方法说明

|参数|类型|必填|说明|
|--|:--|--|--|
|params|Object|是|调用参数|
|success|Function|否|接口调用成功的回调函数	|
|fail|Function|否|接口调用失败的回调函数	|
|complete|Function|否|接口调用结束的回调函数（调用成功、失败都会执行）|



3. calendarAdd 参数一对象值说明

|字段|描述|默认值|是否必填|
|--|:--|--|--|
|name|日历账号名称| |是|
|title|日历标题| |否|
|location|日历地址| |否|
|description|日历描述| |否|
|dtstart|日历开始时间戳毫秒| |是|
|dtend|日历结束时间戳毫秒|开始时间|否|
|reminder|多少分钟前提醒|5|否|


4. 在 manifest.json 文件中找到对应权限并勾选:

```
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

### 鼓励作者
如果你觉得该插件方便实用，并且解决了你的问题。可以小小的赞赏一下作者，你的鼓励会更有动力，加油，一起努力。
