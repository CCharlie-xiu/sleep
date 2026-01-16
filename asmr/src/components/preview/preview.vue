<template>
  <view
    class="preview rela"
    :class="[customClass]"
    :style="[customStyle, { overflow: touchBoxHidden ? 'hidden' : 'visible' }]"
  >
    <x-skeleton
      :loading="videoSrc ? false : isImageLoad"
      :configs="{
        padding: '0',
        headHeight: imageStyle.height || videoStyle.height || '800rpx',
        headWidth: imageStyle.width || videoStyle.width || '100vw',
      }"
      :fadeOutTime="videoSrc ? 0 : 0.1"
      type="banner"
    >
      <more-action
        :customStyle="{
          position: 'absolute',
          zIndex: 10000,
          top: '20rpx',
          right: '20rpx',
        }"
        :templateId="templateId"
        :isLike="isLike"
        :isCollected="isCollected"
        :backgroundWidth="moreWidth"
        @open="handleMoreActionOpen"
        @close="handleMoreActionClose"
        :showShare="showShare"
        v-if="!isWorksDetail"
      />
      <!-- #ifndef APP-PLUS -->
      <view
        :style="[
          imageNaturalSize.width
            ? 'width: ' + imageNaturalSize.width + 'px;'
            : '',
          imageNaturalSize.height
            ? 'height: ' + imageNaturalSize.height + 'px;'
            : '',
        ]"
      >
        <image
          v-if="imageSrc"
          class="pre-image"
          :class="scale == 1 ? 'scale-image' : 'scale-image-none'"
          :src="imageSrc"
          :mode="imageMode"
          :style="[imageStyle, transformStyle]"
          @load="handleImageLoad"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        />
      </view>
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <kf-video
        class="video"
        loop
        v-if="videoSrc && showList"
        :style="[videoStyle]"
        :src="videoSrc"
        :show-play-btn="true"
        :autoplay="true"
        :controls="showControls"
        @click="showControls = true"
        @play="playStartInfo"
        ref="rewardVideoRef"
      />

      <!-- #endif -->
      <!-- #ifndef APP-PLUS -->
      <video
        class="video"
        loop
        id="videoRef"
        v-if="videoSrc"
        :style="[videoStyle]"
        :src="videoSrc"
        :show-play-btn="true"
        :autoplay="true"
        :controls="true"
        ref="videoRef"
        :show-fullscreen-btn="false"
        :show-background-playback-button="false"
      ></video>
      <!-- #endif -->

      <Watermark :isWorksDetail="isWorksDetail" :customStyle="{
        bottom: videoSrc ? '4%' : '2%'
      }"/>
      <fixed-watermark v-if="!videoSrc" />

      <view class="control abso">
        <!--  #ifdef MP-KUAISHOU -->
        <slot name="controlCustom"></slot>
        <image
          v-if="sourceImage && !$slots['controlCustom']"
          class="control-sourceImage abso"
          :src="sourceImage"
          :style="[sourceImageStyle]"
          mode="widthFix"
        />
        <!--  #endif -->
        <!--  #ifndef MP-KUAISHOU -->
        <slot name="control-custom">
          <image
            v-if="sourceImage"
            class="control-sourceImage abso"
            :src="sourceImage"
            :style="[sourceImageStyle]"
            mode="widthFix"
          />
        </slot>
        <!--  #endif -->
      </view>
    </x-skeleton>
    <!-- #ifdef APP-PLUS -->
    <view class="imgView" v-if="imageSrc">
      <view
        :style="[
          imageNaturalSize.width
            ? 'width: ' + imageNaturalSize.width + 'px;'
            : '',
          imageNaturalSize.height
            ? 'height: ' + imageNaturalSize.height + 'px;'
            : '',
        ]"
      >
        <image
          v-if="imageSrc"
          class="pre-image"
          :class="scale == 1 ? 'scale-image' : 'scale-image-none'"
          :src="imageSrc + '?v=' + Date.now() + Math.random()"
          :mode="imageMode"
          :style="[imageStyle, transformStyle]"
          @load="handleImageLoad"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        />
      </view>
      <view class="control abso">
        <slot name="control-custom">
          <image
            v-if="sourceImage"
            class="control-sourceImage abso"
            :src="sourceImage"
            :style="[sourceImageStyle]"
            mode="widthFix"
          />
        </slot>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>
<script setup>
import { useUserStore } from "@/store/user.js";
import throttle from "@/common/utils/throttle";
import {
  ref,
  computed,
  watch,
  getCurrentInstance,
  onMounted,
  onUnmounted,
} from "vue";
import { useaAppConfigStore } from "@/store/appConfig";
import Watermark from "@/components/watermark/index.vue";
import moreAction from "./more-action.vue";
const { config } = useaAppConfigStore();
const userStore = useUserStore();
const { userInfo } = userStore;
const emit = defineEmits(["handleLike", "handleCollect", "load"]);
const props = defineProps({
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  customClass: {
    type: String,
    default: "",
  },
  imageStyle: {
    type: Object,
    default: () => ({}),
  },
  videoStyle: {
    type: Object,
    default: () => ({}),
  },
  imageSrc: {
    type: String,
    default: "",
  },
  imageMode: {
    type: String,
    default: "scaleToFill",
  },
  videoSrc: {
    type: String,
    default: "",
  },
  likeStyle: {
    type: Object,
    default: () => ({}),
  },
  collectStyle: {
    type: Object,
    default: () => ({}),
  },
  showControl: {
    type: Boolean,
    default: true,
  },
  isLike: {
    type: Boolean,
    default: false,
  },
  isCollected: {
    type: Boolean,
    default: false,
  },
  sourceImage: {
    type: String,
    default: "",
  },
  sourceImageStyle: {
    type: Object,
    default: () => ({}),
  },
  isZoom: {
    type: Boolean,
    default: false,
  },
  isWorksDetail: {
    type: Boolean,
    default: false,
  },
  templateId: {
    type: String,
    default: "",
  },
  showShare: {
    type: Boolean,
    default: true,
  },
  showList: {
    type: Boolean,
    default: true,
  },
  firstShowControl: {
    type: Boolean,
    default: false,
  },
});
const { proxy } = getCurrentInstance();
const routerParam = proxy.$Router.getRouterParams();
const videoContext = ref(null);
const rewardVideoRef = ref(null);
const videoRef = ref(null);
const showControls = ref(props.firstShowControl && props.showList)

watch(
  () => props.showList,
  (val) => {
    console.log('执行了 watch 回调', val)
    videoContext.value = uni.createVideoContext("videoRef", proxy);
    if (!videoContext.value) return;
    // #ifdef APP-PLUS
    playStartInfo()
    // #endif
    if (val) {
      // 说明要展示
      // #ifndef APP-PLUS
      videoContext.value.play();
      // #endif
    } else {
      // 说明不展示
    showControls.value = false
      // #ifndef APP-PLUS
      videoContext.value.pause();
      // #endif
    }
  },
  { immediate: true }
)


const playStartInfo = () => {
  console.log('playStartInfo',rewardVideoRef.value.pause);
  if(!props.showList) {
    rewardVideoRef.value?.pause();
  } else {
    rewardVideoRef.value?.play()
  }
}


const templateId = computed(() => props.templateId);
const activeLike = ref(false);
const activeCollect = ref(false);
const localLikeNum = ref(props.likeNum);
const localCollectNum = ref(props.collectNum);
const isImageLoad = ref(true);
isImageLoad.value = false;

// #ifdef MP-KUAISHOU
isImageLoad.value = false;
// #endif

const imageNaturalSize = ref({
  width: 0,
  height: 0,
  naturalWidth: 0,
  naturalHeight: 0,
});

// 缩放和平移状态
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const lastScale = ref(1);
const lastTranslateX = ref(0);
const lastTranslateY = ref(0);
const touches = ref([]);
const initialDistance = ref(0);
const initialCenterX = ref(0);
const initialCenterY = ref(0);
const initialTouchX = ref(0);
const initialTouchY = ref(0);
const touchBoxHidden = ref(true);
const moreWidth = computed(() => {
  const widthStr = props.videoStyle.width || "0";
  const widthNum = Number(widthStr.replace(/[^\d]/g, "")); // 结果 702
  return imageNaturalSize.value.width || uni.upx2px(widthNum) || 400;
});

// 计算transform样式
const transformStyle = computed(() => {
  return {
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  };
});

// 计算两点间距离
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// 计算两点中心
const getCenter = (touch1, touch2) => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
};

const playStart = (e) => {
  console.log("playStart", e);
};

const playPause = (e) => {
  console.log("playStart", e);
};

const handleImageLoad = (e) => {
  // 获取图片的自然尺寸
  emit("load", e);
  //console.log("图片加载完成:", e);
  const { width: naturalWidth, height: naturalHeight } = e.detail;
  // 延时获取图片在页面中的实际展示尺寸
  setTimeout(() => {
    uni
      .createSelectorQuery()
      .in(proxy)
      .select(".pre-image")
      .boundingClientRect((rect) => {
        //console.log("boundingClientRect:", rect);
        if (rect && rect.width > 0 && rect.height > 0) {
          const displaySize = {
            width: rect.width,
            height: rect.height,
            naturalWidth,
            naturalHeight,
          };
          // console.log("图片展示尺寸:", displaySize);
          // 保存图片尺寸到响应式变量
          imageNaturalSize.value = displaySize;
        } else {
          // 如果还是获取不到，再次尝试
          console.log("第一次获取失败，再次尝试...");
          setTimeout(() => {
            uni
              .createSelectorQuery()
              .in(proxy)
              .select(".pre-image")
              .boundingClientRect((rect2) => {
                console.log("第二次 boundingClientRect:", rect2);
                if (rect2 && rect2.width > 0 && rect2.height > 0) {
                  const displaySize = {
                    width: rect2.width,
                    height: rect2.height,
                    naturalWidth,
                    naturalHeight,
                  };
                  console.log("图片展示尺寸(第二次):", displaySize);
                  imageNaturalSize.value = displaySize;
                }
              })
              .exec();
          }, 200);
        }
      })
      .exec();
    isImageLoad.value = false;
  }, 100);
};

// 触摸开始
const handleTouchStart = (e) => {
  if (!props.isZoom) return; // 如果不允许缩放，直接返回
  if (imageNaturalSize.value.height <= 0 || imageNaturalSize.value.width <= 0)
    return;

  touches.value = Array.from(e.touches);
  console.log(touches.value);

  if (touches.value.length === 2) {
    // 双指缩放开始，阻止默认行为
    e.preventDefault();
    initialDistance.value = getDistance(touches.value[0], touches.value[1]);
    const center = getCenter(touches.value[0], touches.value[1]);
    initialCenterX.value = center.x;
    initialCenterY.value = center.y;
  } else if (touches.value.length === 1) {
    // 单指触摸开始，记录初始位置，但不阻止默认行为（允许滚动）
    initialTouchX.value = touches.value[0].clientX;
    initialTouchY.value = touches.value[0].clientY;
  }
};

// 触摸移动
const handleTouchMove = (e) => {
  if (!props.isZoom) return; // 如果不允许缩放，直接返回
  if (imageNaturalSize.value.height <= 0 || imageNaturalSize.value.width <= 0)
    return;

  touches.value = Array.from(e.touches);

  if (touches.value.length === 2) {
    // 双指缩放，阻止默认滚动
    e.preventDefault();
    const currentDistance = getDistance(touches.value[0], touches.value[1]);
    const scaleRatio = currentDistance / initialDistance.value;
    const newScale = lastScale.value * scaleRatio;

    // 限制缩放范围
    scale.value = Math.max(0.5, Math.min(3, newScale));

    // 计算缩放中心偏移
    const center = getCenter(touches.value[0], touches.value[1]);
    const deltaX = center.x - initialCenterX.value;
    const deltaY = center.y - initialCenterY.value;

    translateX.value = lastTranslateX.value + deltaX;
    translateY.value = lastTranslateY.value + deltaY;
  } else if (touches.value.length === 1) {
    if (scale.value > 1) {
      // 单指拖拽（仅在放大状态下），阻止默认滚动
      e.preventDefault();
      const deltaX = touches.value[0].clientX - initialTouchX.value;
      const deltaY = touches.value[0].clientY - initialTouchY.value;

      translateX.value = lastTranslateX.value + deltaX;
      translateY.value = lastTranslateY.value + deltaY;
    } else {
      // 未放大时，允许页面正常滚动
      return;
    }
  }
};

// 触摸结束
const handleTouchEnd = (e) => {
  if (!props.isZoom) return; // 如果不允许缩放，直接返回
  if (imageNaturalSize.value.height <= 0 || imageNaturalSize.value.width <= 0)
    return;

  touches.value = Array.from(e.touches);

  if (touches.value.length === 0) {
    // 如果缩放小于1，重置到原始状态
    if (scale.value < 1) {
      e.preventDefault();
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      lastScale.value = 1;
      lastTranslateX.value = 0;
      lastTranslateY.value = 0;
    } else if (scale.value > 1) {
      // 保存当前状态（图片处于放大状态时）
      e.preventDefault();
      lastScale.value = scale.value;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    } else {
      // 未放大时，允许默认行为（滚动）
      return;
    }
  }
};

// 点赞收藏显示隐藏
const handleMoreActionOpen = () => {
  touchBoxHidden.value = false;
};
const handleMoreActionClose = () => {
  touchBoxHidden.value = true;
};

onMounted(() => {
  // if(isShare.value) {
  //   isWaterMark.value = true;
  // }
  // 创建可见性观察器
  console.log("routerParam", routerParam);
});

defineExpose({
  videoRef,
});
</script>
<style lang="scss" scoped>
.preview {
  // overflow: hidden;
  position: relative;

  .pre-image {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    transform-origin: center center;
    position: relative;
    z-index: 0;
  }

  .scale-image {
    touch-action: pan-y; // 允许垂直方向滚动，仍可通过JS阻止（在放大时）
  }

  .scale-image-none {
    touch-action: none;
  }

  .pre-image.no-transition {
    transition: none;
  }

  .control {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    .custom-item {
      right: 47rpx;
      bottom: 70rpx;

      text {
        text-shadow: 0rpx 2rpx 10rpx rgba(19, 14, 34, 0.29);
      }
    }

    .like {
      image {
        width: 60rpx;
        height: 54rpx;
      }
    }

    .collect {
      image {
        width: 60rpx;
        height: 60rpx;
      }
    }

    .like,
    .collect {
      z-index: 1;
      transition: 0.3s ease;

      text {
        &.active {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    .control-sourceImage {
      bottom: 24rpx;
      left: 24rpx;
      width: 100rpx;
      height: 134rpx;
      border-radius: 20rpx;
      border: 4px solid var(--var_bg_v18_color);
    }
  }

  .watermark {
    right: 40rpx;
    bottom: 40rpx;
    width: 122rpx;
    height: 27rpx;
    z-index: 1;
    pointer-events: none;
    /* 水印不拦截点击事件 */
  }
}

.control {
  pointer-events: none;
  /* 控制层不拦截点击 */
}

.control > view {
  pointer-events: auto;
  /* 子元素（如点赞/收藏）恢复点击 */
}
</style>
