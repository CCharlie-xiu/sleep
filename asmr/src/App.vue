<script setup lang="ts">
import Debounce from "@/common/utils/debounce";
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { promiseTimeOut } from "@/common/utils/util";
import initData from "@/common/initModule/init";
import { useUserStore } from "@/store/user.js";
import { useDrawingStore } from "@/store/drawing";
import { setStorageSync } from "@/common/utils/storage.js";
import { IS_BUY_MEMBER } from "@/common/data/constants"
const debounce = new Debounce();
// #ifdef APP-PLUS
import { keychainPlus } from "@/common/utils/util.js";
// #endif
onLaunch(async () => {
  console.log("App Launch");
  setStorageSync(IS_BUY_MEMBER,'0')
  // 启动事件 launch_app
  // #ifdef APP-PLUS
  setTimeout(() => {
    console.log("启动完毕，3秒后关闭启动图");
    plus.navigator.closeSplashscreen()
  },3000)
  plus.device.getInfo({
  	success:async function(e){
  		console.log('idfa =  '+JSON.stringify(e.idfa));
      // 01335907-3296-4B75-BDDB-8AA18D26EC75
      // itunes重置，删除时是手机最后一个app
      await keychainPlus.set("idfa", e.idfa)
  	},
  	fail:function(e){
  		console.log('getDeviceInfo failed: '+JSON.stringify(e));
  	}
  });
  const UIDevice = plus.ios.importClass("UIDevice");
  const currentDevice = UIDevice.currentDevice();
  const identifierForVendor = currentDevice.identifierForVendor()
  const idfv = plus.ios.invoke(identifierForVendor, "UUIDString")
  console.log('idfv:', idfv)
  await keychainPlus.set("idfv", idfv)
  // #endif
  promiseTimeOut(initData(), 1500, "initData timeout");
});
onShow(() => {
  console.log("App Show");
  const { userInfo,REFRESH_TOKEN } = useUserStore();
  if (userInfo.user_id) {
    const { adjustQueue } = useDrawingStore();
    debounce.start(() => {
      REFRESH_TOKEN()
    },5000,true)
    adjustQueue();
  }
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/styles/themeVar.scss";
@import "@/styles/page.scss";
@import "@/uni_modules/tuniaoui-vue3/index.css";
@import "@/styles/common.scss";
@import "@/styles/theme.scss";
@import "@/styles/index.scss";
</style>
