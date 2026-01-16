<template>
  <view
    class="custom-tabbar tn-flex-row safearea-p-b"
    :style="[
      {
        background: $themeConfig.tabbar_bg_color,
        '--active-color': $themeConfig.tabbar_active_font_color,
        '--color': $themeConfig.tabbar_font_color,
      },
    ]"
  >
    <view class="bg abso"></view>
    <view class="custom-tabbar-container tn-flex-1 tn-flex rela">
      <view
        class="custom-tabbar-item tn-flex-1 tn-flex-column tn-flex items-center"
        hover-class="hover-class"
        v-for="(tab, index) in tabbar"
        :key="tab.name"
        :class="{ active: currentTab === index }"
        @click="changeTab(index)"
      >
        <image
          class="custom-tabbar-item-icon mt-18 mb-10"
          :style="[tab.iconStyle]"
          :src="`/static/tabbar/${$themeName}/${
            tab.icon + (currentTab === index ? '-a' : '')
          }.png`"
          mode="aspectFit"
        ></image>
        <text class="custom-tabbar-item-text font-size-20">
          {{ tab.title }}
        </text>
      </view>
    </view>
  </view>
</template>
<script setup>
import throttle from "@/common/utils/throttle";
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const tabbar = ref([
  {
    name: "index",
    icon: "home",
    iconStyle: {
      width: "52rpx",
      height: "40rpx",
    },
    title: "",
  },
  {
    name: "video",
    icon: "video",
    iconStyle: {
      width: "44rpx",
      height: "41rpx",
    },
    title: "",
  },
  {
    name: "play",
    icon: "play",
    iconStyle: {
      width: "44rpx",
      height: "41rpx",
    },
    title: "",
  },
  {
    name: "free",
    icon: "free",
    iconStyle: {
      width: "38rpx",
      height: "40rpx",
    },
    title: "",
  },
  {
    name: "mine",
    icon: "mine",
    iconStyle: {
      width: "41rpx",
      height: "41rpx",
    },
    title: "",
  },
]);

const currentTab = ref(props.value || 0);
const isPreLoad = ref(true);

watch(
  () => props.modelValue,
  (val) => {
    currentTab.value = val;
  },
  {
    immediate: true,
  }
);
watch(
  () => currentTab.value,
  (val) => {
    emit("update:modelValue", val);
  }
);

const changeTab = (index) => {
  throttle(
    () => {
      if (index !== currentTab.value) {
        // currentTab.value = index;
        emit("change", index, tabbar.value[index]);
      }
    },
    100,
    false
  );
};

onMounted(() => {
  setTimeout(() => {
    isPreLoad.value = false;
  }, 500);
});
</script>
<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0rpx;
  width: 750rpx;
  z-index: 99;
  font-weight: 400;
  height: 156rpx;
  border: 1rpx solid rgba(254, 254, 255, 0.47);
  border-bottom: none;
  border-radius: 40rpx 40rpx 0 0;
  font-size: 28rpx;
  &-container {
    // padding-bottom: var(--padding-bottom, 10rpx);
  }
  &-item {
    height: 100%;
    color: var(--color);
    &.active {
      color: var(--active-color);
    }
    &-icon {
      vertical-align: middle;
    }
  }
  &-preload {
    left: 9999px;
    top: 9999px;
  }
}
</style>
