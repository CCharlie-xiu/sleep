<template>
  <view class="container">
    <button @click="setKeychain">Set Keychain</button>
    <button @click="getKeychain">Get Keychain</button>
    <button @click="clearKeychain">Clear Keychain</button>

    <view class="result">
      <text>当前值: {{ result }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
let result = ref()
const plug = uni.requireNativePlugin("Html5app-KeyChain")
const myservice = 'com.kuaifuinfo.funplay'
const setKeychain = () => {
  plug.saveValue({
   "key": "youkey",
   "value":"ghj123456789",
   "service": myservice
   },ret=>{
    console.log("原始返回:", ret)
    result.value = JSON.stringify(ret)
  }); 
}
const getKeychain = () => {
  plug.selectKey(
    {
      "key": "youkey",
      "service": myservice
    }, ret => {
      console.log("原始返回:", ret)
    result.value = JSON.stringify(ret)
  });
}
const clearKeychain = () => {
  plug.deleteKey(
    {
      "key": "youkey",
      "service": myservice
    }, ret => {
      console.log("原始返回:", ret)
    result.value = JSON.stringify(ret)
  });
}
/* // u7746-Keychain
var bfjrModule = uni.requireNativePlugin('u7746-Keychain');
//设置
var param = {};
param.forService = "test.com.kuaifuinfo.funplay"; //可以理解为别名
param.account = "account";
param.value = "test"; //要存储的内容
bfjrModule.setKeychainPasswordAsync(param, (ret) => {
    //rtMsg["code"] 为1时为操作成功 -1操作失败
    var rtMsg = JSON.parse(ret);
    result.value = rtMsg["code"] + '操作成功'
    console.log('chufale')
});

//读取
var param = {};
param.forService = "service"; //可以理解为别名
param.account = "account";
bfjrModule.getKeychainPasswordAsync(param, (ret) => {
    //rtMsg["code"] 为1时为操作成功 -1操作失败
    //code="1"时 rtMsg["value"]为取出的内容
    var rtMsg = JSON.parse(ret);
    result.value = rtMsg["code"] + '操作成功' + rtMsg["value"]
});

//删除
var param = {};
param.forService = "service"; //可以理解为别名
param.account = "account";
bfjrModule.delKeychainPasswordAsync(param, (ret) => {
    //rtMsg["code"] 为1时为操作成功 -1操作失败
    var rtMsg = JSON.parse(ret);
    result.value = rtMsg["code"] + '操作成功'
}); */
</script>

<style scoped>
.container {
  padding: 20rpx;
  position: absolute;
  top: 500rpx;
  background-color: black;
  left: 0;
  z-index: 20078;
  width: 750rpx;
}
button {
  margin: 10rpx 0;
}
.result {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
