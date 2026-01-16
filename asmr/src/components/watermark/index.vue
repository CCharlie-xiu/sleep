<template>
  <view class="watermark abso" :style="customStyle" v-if="(isShare && isWorksDetail) || isWaterMark">
    <image :src="config.watermark" mode="widthFix"></image>
  </view>
</template>
<script setup>
import { useUserStore } from "@/store/user.js";
import { computed, watch, getCurrentInstance, onMounted } from "vue";
import { useaAppConfigStore } from "@/store/appConfig";
const { config } = storeToRefs(useaAppConfigStore());
const { userInfo } = storeToRefs(useUserStore());
const emit = defineEmits([]);
const props = defineProps({
  isWorksDetail: {
    type: Boolean,
    default: false,
  },
  customStyle:{
    type: Object,
    default: () => ({})
  }
});
const { proxy } = getCurrentInstance();
const routerParam = proxy.$Router.getRouterParams();
const isShare = routerParam?.query?.isShare ?? false;
// 是否加水印
const isWaterMark = computed(() => {
  // 如果配置关闭水印，则不显示水印
  if (!config.value.watermark) {
    return false;
  }
  
  // 获取当前用户信息
  const currentUserInfo = userInfo.value;
  
  // 如果用户信息还没有完全加载（isVip字段未定义），暂时不显示水印
  // 这样可以避免在登录后短暂显示水印的问题
  if (!currentUserInfo) {
    console.log('未登录用户显示水印', currentUserInfo);
    return true;
  }
  
  // 如果配置开启水印，VIP用户不显示水印，非VIP显示水印
  // console.log('水印判断：isVip =', currentUserInfo.isVip, '显示水印 =', !currentUserInfo.isVip);
  return !currentUserInfo.isVip;
});



onMounted(() => {
});
</script>
<style lang="scss" scoped>
.watermark {
  right: 2%;
  bottom:  2%;
  width: 122rpx;
  height: 27rpx;
  z-index: 299;
  pointer-events: none; /* 水印不拦截点击事件 */
}
</style>
