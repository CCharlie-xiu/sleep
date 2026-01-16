<template>
  <custom-popup
    v-model="visible"
    open-direction="center"
    :overlay-opacity="0.5"
    :overlay-closeable="true"
    :showHeader="false"
    radius="40"
  >
    <view
      class="lessPoint tn-flex-center-center px-60 py-48 tn-flex-column rela"
    >
      <image
        class="lessPoint-img"
        :src="`${$staticPath.mine}/less-point-icon.png`"
      ></image>
      <view class="font-color-v35 font-weight-700 font-size-36 mt-24"
        >积分不足</view
      >
      <view class="font-color-v72 foont-size-30 font-weight-400 mt-32"
        >仅需{{ actualPoint }}积分可继续创作</view
      >
      <view class="point-now px-40 bg-color-v31 tn-flex-center-center mt-32">
        <image
          class="point-now-icon mr-8"
          :src="`${$staticPath.mine}/integral-icon.png`"
          mode="width"
        />
        <view class="font-size-32 font-weight-400 font-color-v71"
          >当前积分：{{ $credit.value.balance }}</view
        >
      </view>

      <view v-if="memberEntrance || pointEntrance || showAdButton" class="font-size-28 font-weight-400 mt-48 font-color-v70"
        >选择以下方式获取更多积分</view
      >
      <view class="button-container tn-flex-row mt-38">
        <tn-button
          v-if="pointEntrance"
          customClass="bg-color-v55 font-size-32 font-color-v1"
          :customStyle="{
            width: '100%',
            borderRadius: '20rpx',
            height: '103rpx',
            marginRight: showAdButton && adEntrance ? '42rpx' : '0',
          }"
          <!-- #ifdef MP-KUAISHOU -->
          :style="{
            width: '100%',
            marginRight: showAdButton && adEntrance ? '42rpx' : '0',
          }"
          <!-- #endif -->
          @click="handleToPoint"
        >
          <image
            class="btn-image mr-16"
            mode="widthFix"
            :src="`${$staticPath.mine}/shopping-cart-icon.png`"
          />
          <view>购买积分</view>
        </tn-button>

        <tn-button
          v-if="showAdButton && adEntrance"
          customClass="bg-color-v61"
          :customStyle="{
            width: '100%',
            borderRadius: '20rpx',
            height: '103rpx',
          }"
          <!-- #ifdef MP-KUAISHOU -->
          style="width: 100%;"
          <!-- #endif -->
          @click="handleShowAd"
        >
          <image
            class="btn-image mr-16"
            mode="widthFix"
            :src="`${$staticPath.mine}/watch-ad-icon.png`"
          />
          <view class="font-size-30 font-weight-400">
            <view class="font-color-v77"
              >{{ lessPointAd.rewardQuantity }}积分</view
            >
            <view class="font-color-v1">观看广告</view>
          </view>
        </tn-button>
      </view>

      <tn-button
        v-if="memberEntrance"
        customClass="bg-color-v37 font-size-32 font-color-v1 mt-30"
        :customStyle="{
          width: '526rpx',
          height: '103rpx',
          borderRadius: '20rpx',
        }"
        @click="handleToMenber"
      >
        <image
          class="btn-image mr-16"
          mode="widthFix"
          :src="`${$staticPath.mine}/star-menber-icon.png`"
        />
        <view>订阅会员</view>
      </tn-button>

      <view class="close abso" @click="visible = false">
        <tn-icon name="close" />
      </view>
    </view>
  </custom-popup>

  <custom-popup
    v-model="showAdSuccess"
    open-direction="center"
    :overlay-opacity="0.5"
    :overlay-closeable="true"
    :showHeader="false"
    radius="40"
  >
    <view
      class="getPoint tn-flex-center-center px-42 pt-70 pb-42 tn-flex-column rela"
    >
      <view class="tn-flex items-center">
        <image
          class="getPoint-img"
          :src="`${$staticPath.mine}/get-point-icon.png`"
        ></image>
        <view class="ml-32 font-color-v78 font-weight-700 font-size-66"
          >+{{ lessPointAd.rewardQuantity }}</view
        >
      </view>
      <view
        v-if="lessPointAd.performableTimes === rewardTimes"
        class="text font-color-v79 font-size-24 font-weight-400 mt-42"
      >
        今日观看次数已达上限</view
      >
      <view
        v-else
        class="text font-color-v79 font-size-24 font-weight-400 mt-42"
        >今天还可观看{{
          lessPointAd.performableTimes - rewardTimes
        }}个广告</view
      >
      <view class="w-100 mt-14">
        <tn-line-progress
          :percent="progressPercent"
          height="8"
          :duration="300"
          :active-color="$themeConfig.var_bg_v30_color"
          :inactive-color="$themeConfig.var_bg_v29_color"
        />
      </view>

      <view class="button tn-flex-row mt-36">
        <tn-button
          v-if="!(lessPointAd.performableTimes === rewardTimes)"
          customClass="bg-color-v55 font-size-32 font-color-v1"
          :customStyle="{
            width: '100%',
            borderRadius: '20rpx',
            height: '103rpx',
            marginRight: '34rpx',
          }"
          @click="handleSeeAgain"
        >
          再看一个
        </tn-button>
        <tn-button
          customClass="bg-color-v62 font-size-32 font-color-v1"
          :customStyle="{
            width: '100%',
            borderRadius: '20rpx',
            height: '103rpx',
          }"
          @click="showAdSuccess = false"
        >
          开心收下
        </tn-button>
      </view>

      <view class="close abso" @click="showAdSuccess = false">
        <tn-icon name="close" />
      </view>
    </view>
  </custom-popup>
  <c-uni-ad ref="uniAdRef" :adConfig="adList" @adPlayed="adFinish"></c-uni-ad>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import ZTabs from "@/components/z-tabs/components/z-tabs/z-tabs.vue";
import ZPaging from "@/components/z-paging/components/z-paging/z-paging.vue";
import dayjs from "dayjs";
// API 调用已移除 - listCreditHistory, queryAdActivity
import { useUserStore } from "@/store/user.js";
import useAd from "@/hooks/useAd";
import { initMemberInfo } from "@/common/initModule/mpInit.js";
import { serviceCodeEnum } from "@/common/data/enum";
import { useaAppConfigStore } from "@/store/appConfig";
const { userInfo } = useUserStore();
const { pointEntrance, memberEntrance, adEntrance } = storeToRefs(useaAppConfigStore());
const { proxy } = getCurrentInstance();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  actualPoint: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const showAdSuccess = ref(false);
const lessPointAd = ref({});

const nowPoilt = ref(0); // 存储初始积分
const pollCount = ref(0); // 轮询次数
const pollInterval = ref(); // 定时器
const rewardTimes = ref(0); //初次进入过去已观看的次数

const adConfigs = {
  pageCode: "creation",
  adScene: "lessPoint",
};

const { getAd, showAd, adList, uniAdRef } = useAd(adConfigs);

getAd();

const routerParam = proxy.$Router.getRouterParams()?.query;
const sc = routerParam?.sc;

const showAdButton = computed(() => {
  return [
    serviceCodeEnum.wallpaper,
    serviceCodeEnum.avatar,
    serviceCodeEnum.background,
  ].includes(sc);
});

const progressPercent = computed(() => {
  const total = lessPointAd.value.performableTimes || 1; // 默认1避免除以0
  const completed = rewardTimes.value || 0;
  return Math.min(100, Math.max(0, (completed / total) * 100));
});

const handleToPoint = () => {
  visible.value = false;
  proxy.$Router.push("/minePages/goods/points", { query: { t: "购买积分" } });
};

const handleToMenber = () => {
  visible.value = false;
  proxy.$Router.push("/minePages/goods/member", { query: { t: "会员订阅" } });
};

const handleSeeAgain = () => {
  showAdSuccess.value = false;
  handleShowAd();
};

const handleShowAd = () => {
  if (lessPointAd.value.performableTimes === rewardTimes.value) {
    proxy.$Tips.toast("今日观看次数已达上限");
    return false;
  }
  pollCount.value = 0;
  showAd({
    reportParams: {
      activityId: lessPointAd.value.id,
      ...adConfigs,
    },
    adParams: {
      adScene: adConfigs.adScene,
    },
  })
    .then((res) => {
      adFinish();
      console.debug("res #debug ===========>", res);
    })
    .catch((err) => {
      console.debug("err #debug ===========>", err);
    });
};
// 广告看完后的回调
const adFinish = () => {
  rewardTimes.value = rewardTimes.value + 1;
  nextTick(() => {
    visible.value = false;
    showAdSuccess.value = true;
    // 开始轮询检查积分是否增加
    initMemberInfo();
    checkCreditIncrease();
  });
};

const initAd = () => {
  queryAdActivity(adConfigs).then((res) => {
    const data = res.data.queryAdActivity.record;
    lessPointAd.value = data;
    rewardTimes.value = data.rewardTimes;
  });
};

// 监听弹窗显示状态
watch(
  () => visible.value,
  (val) => {
    if (val) {
      nowPoilt.value = JSON.parse(JSON.stringify(proxy.$credit.value.balance));
      pollCount.value = 0;
      initAd();
    }
  },
  { immediate: true }
);
const checkCreditIncrease = () => {
  if (proxy.$credit.value.balance > nowPoilt.value) {
    return;
  }
  pollInterval.value = setInterval(() => {
    pollCount.value++;
    if (proxy.$credit.value.balance > nowPoilt.value) {
      clearInterval(pollInterval.value);
      return;
    }
    if (pollCount.value >= 3) {
      clearInterval(pollInterval.value);
      initMemberInfo();
    }
  }, 2000);
};

// 组件卸载时清除定时器（避免内存泄漏）
onBeforeUnmount(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
  }
});

onMounted(() => {
  initAd();
});
</script>

<style lang="scss" scoped>
.lessPoint {
  border-radius: 25rpx;
  width: 650rpx;
  .lessPoint-img {
    width: 144rpx;
    height: 144rpx;
  }
  .point-now {
    height: 86rpx;
    border-radius: 20rpx;
    .point-now-icon {
      width: 40rpx;
      height: 40rpx;
    }
  }
  .btn-image {
    width: 40rpx;
    height: 40rpx;
    overflow: initial;
  }
}

.getPoint {
  width: 588rpx;
  border-radius: 30rpx;
  .getPoint-img {
    width: 138rpx;
    height: 85rpx;
  }
  .text {
    width: 100%;
    text-align: end;
  }
  .button {
    justify-content: space-between;
    width: 494rpx;
  }
}

.close {
  top: 30rpx;
  right: 30rpx;
}

.button-container {
  justify-content: space-between;
  width: 526rpx;
}
</style>