<template>
	<view class="sdkTest">
		<tn-button @click="setup">初始化</tn-button>
		<tn-button @click="setUplog">上报</tn-button>
		<tn-button @click="getIdfv">获取idfv</tn-button>
		<tn-button  @click="openRate">
        应用内打开AppStore评分
    </tn-button>
  </view>
</template>
<script setup>
  import { useUserStore } from "@/store/user.js";
	const plugin = uni.requireNativePlugin("JQ-RangersAppLog-AppModule")
	const storeKit = uni.requireNativePlugin('Xty-StoreKit')

  const { userInfo } = useUserStore();
	const setup = () => {
		console.log('plugin',plugin)
		//初始化
		plugin.configApp({
      appID: userInfo.user_id,
      channel: 'apple',
      autoTrackEnabled: true, //全埋点开关，true开启，false关闭
			showDebugLog: true, // true:开启日志，需要参考4.3设置Logger，false:关闭日志
			logNeedEncrypt: true, //加密开关，true开启，false关闭
    })
	}

	const setUplog = () => {
		console.log('setupAppLog',plugin.setupAppLog)
		plugin.setupAppLog({
		'uid': userInfo.user_id,
		'channel': 'App Store',
		'abEnable': true,
		'autoTrackEnabled': true,
		'showDebugLog': true,
		'clearABCacheOnUserChange': true,
		'logNeedEncrypt': true,
		'gameModeEnable': true
		}, (cal) => {
		  console.log(cal);
		})
	}

	
const openRate = () => {
  storeKit.review()
}

const getIdfv = async () => {
  const UIDevice = plus.ios.importClass("UIDevice");
  const currentDevice = UIDevice.currentDevice();
  const identifierForVendor = currentDevice.identifierForVendor();
  const idfv = plus.ios.invoke(identifierForVendor, "UUIDString")
  console.log('idfv:', idfv);
  return idfv;
}

</script>

<style scoped>
.sdkTest {
  position: absolute;
  top: 200rpx;
  left: 0;
  width: 750rpx;
  height: 500rpx;
  background-color: bisque;
}
</style>