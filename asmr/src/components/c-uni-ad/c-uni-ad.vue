<template>
  <!-- #ifdef MP-WEIXIN -->
  <view>
    <block  v-for="(item, index) in filterAdConfig" :key="item.adParams.adpid">
      <ad-rewarded-video
        v-if="item.type === 'rewardedVideo'"
        v-bind="item.adParams"
        ref="adRef"
        @load="onadload"
        @close="onadclose($event, item.type)"
        @error="onaderror"
      >
      </ad-rewarded-video>
      <ad-interstitial
        v-if="item.type === 'interstitial'"
        v-bind="item.adParams"
        ref="adRef"
        @load="onadload"
        @close="onadclose($event, item.type)"
        @error="onaderror"
      >
      </ad-interstitial>
    </block>

  </view>
    <!-- #endif -->
</template>
<script setup>
import { faltAdConfig, obj2KeyValue } from '@/common/ad/manage';
// API 调用已移除 - submitAd
import { initMemberInfo } from "@/common/initModule/mpInit.js";
import { ref } from 'vue';
const props = defineProps({
  adConfig:  {
    type: Array,
    default: () => ([])
  },
});
const { proxy } = getCurrentInstance();
const emit = defineEmits(['adPlayed']);
const adRef = ref();

const filterAdConfig = computed(() => {
  const adList = faltAdConfig(props.adConfig);
  return adList.filter((item) => item.platform === 'uniad')
})
let repParams;
let currentAdConfig;
let isShowToast = true;
let isRefreshUser = true;

const onadload = (e) => {
  console.log("广告数据加载成功");
};
const onadclose = (e, type) => {
  proxy.$Tips.loaded();
  if(type === 'rewardedVideo'){
    const detail = e.detail;
    // 用户点击了【关闭广告】按钮
    if (detail && detail.isEnded) {
      // 正常播放结束
      submitAd({
        ...repParams,
        ...currentAdConfig,
        adParams: obj2KeyValue(currentAdConfig.adParams)
      })
      .then(() => {
        isRefreshUser && initMemberInfo();
        emit('adPlayed')
      })
      console.log("onClose " + detail.isEnded);
    } else {
      isShowToast && proxy.$Tips.toast('广告未完整观看, 无法领取奖励');
      // 播放中途退出
      console.log("onClose " + detail.isEnded);
    }
  }
  //this.isLoading = true;
  //this.$refs.adRewardedVideo.load();
};
const onaderror = (e) => {
  // 广告加载失败
  proxy.$Tips.loaded();
  console.log(e.detail);
  // this.isLoading = false;
};

const showAd = (reportParams, adParams, otherParams = {}) => {
  const { adScene } = adParams;
  if(otherParams){
    isShowToast = !!otherParams.isShowToast;
    isRefreshUser = !!otherParams.isRefreshUser;
  }
  const find = filterAdConfig.value.find(item => item.adScene === adScene);
  
  if (!find) {
    isShowToast && proxy.$Tips.toast('暂无可观看广告');
    return;
  }
  repParams = reportParams;
  currentAdConfig = find;
  const adFind = adRef.value.find(item => item.adpid === find.adParams.adpid);
  if(adFind){
    isShowToast && proxy.$Tips.loading();
    adFind.show()
  }
}

defineExpose({
  showAd
})
</script>