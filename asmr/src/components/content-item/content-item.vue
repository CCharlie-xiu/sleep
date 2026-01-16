<template>
  <view
    class="content-item rela"
    :style="[
      customStyle,
      {
        borderRadius: borderRadius,
      },
    ]"
    :class="[customClass]"
    :hover-class="showHover ? 'hover-class' : ''"
    @click="handleClick"
  >
    <slot name="content">
      <tn-lazy-load
        v-if="lazyLoad"
        :src="imageSrc"
        :width="width"
        :height="realHeight"
        :mode="mode"
        :borderRadius="borderRadius"
        @load="handleImageLoad"
      ></tn-lazy-load>
      <image
        v-else
        :src="imageSrc"
        :mode="mode"
        :style="{
          width: width,
          height: realHeight,
          borderRadius: borderRadius,
        }"
        @load="handleImageLoad"
      ></image>
    </slot>
    <slot></slot>
    <view
      class="mask ellipsis font-size-24 font-color-v6 abso w-100 tn-text-center"
      :style="[{ borderRadius: `0 0 ${borderRadius} ${borderRadius}` }]"
      v-if="title && !$slots.default"
    >
      {{ title }}
    </view>
    <!-- <view class="vip abso font-size-18 font-color-v10 bg-color-v6" v-if="isVip">
        VIP
      </view> -->
    <!-- <view class="tag abso font-size-22 font-color-v1 py-6 px-16" v-if="tag">
      {{ tag }}
    </view> -->
  </view>
</template>

<script setup>
import { ossResizeUrl, convertUnit } from "@/common/utils/util";
import { computed } from "vue";
const props = defineProps({
  src: {
    type: String,
  },
  mode: {
    type: String,
    default: "widthFix",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: [String, Number],
  },
  borderRadius: {
    type: String,
    default: "0",
  },
  lazyLoad: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: String,
    default: "",
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  // isVip: {
  //   type: Boolean,
  //   default: false
  // },
  title: {
    type: String,
    default: "",
  },
  tag: {
    type: String,
    default: "",
  },
  unit: {
    type: String,
  },
  showHover: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["handleClick", "loaded"]);

const realHeight = computed(() => {
  const type = typeof props.height;
  return type === "undefined"
    ? ""
    : type === "string"
    ? props.height
    : props.height + props.unit;
});
const imageSrc = ref(
  ossResizeUrl({
    url: props.src,
    width: props.width,
    height: realHeight.value,
  })
);

const handleClick = () => {
  emit("handleClick");
};
const handleImageLoad = (e) => {
  emit(
    "loaded",
    (uni.upx2px(convertUnit(props.width, 1)) / e.width) * e.height
  );
};
</script>
<style lang="scss" scoped>
.content-item {
  overflow: hidden;
  flex-shrink: 0;
  .mask {
    background: linear-gradient(#fff0, #0b0912);
    padding: 20rpx;
    bottom: 0;
    left: 0;
  }
  .vip {
    right: 0;
    top: 0;
    padding: 5rpx 16rpx 5rpx 10rpx;
    border-radius: 0rpx 24rpx 0rpx 12rpx;
  }
  .tag {
    right: 0;
    top: 16rpx;
    border-radius: 30rpx 0 0 30rpx;
    background: rgba(var(--var_bg_v53_rgb), 0.73);
  }
}
</style>