<template>
  <tn-popup
    v-model="visible"
    open-direction="bottom"
    :overlay-closeable="true"
    bg-color="transparent"
    @close="handleClose"
    @overlay-click="handleClose"
  >
    <view
      :class="[
        'rewardPoint rela tn-flex-center-center tn-flex-column',
        data.customClass,
      ]"
      :style="data.customStyle"
    >
      <view class="rewardPoint-bg rela">
        <image
          class="bg-img"
          :style="data.bgStyle"
          @click="handleClose"
          mode="widthFix"
          :src="data.bgImg"
          @load="onImageLoad"
        ></image>
        <view
          class="abso close-icon"
          @click="handleClose"
          v-if="data.showCloseBtn"
        >
          <image :src="data.closeBtnSrc" mode="widthFix"></image>
        </view>
        <image
          :style="data.coverTipImgStyle"
          mode="heightFix"
          :src="data.coverTipImg"
          class="abso cover-tip-img"
        />
      </view>
      <view class="rewardPoint-content abso">
        <view
          @click="togglePlay"
          class="rela content"
          v-if="visible && data.videoSrc"
        >
          <!-- #ifdef APP-PLUS -->
          <kf-video
            v-show="isImageLoaded"
            id="rewardVideo"
            ref="rewardVideoRef"
            class="videoType"
            :style="data.coverStyle"
            :src="data.videoSrc"
            :object-fit="data.objectFit"
            :autoplay="false"
            loop
            :poster="data.coverImg"
            :controls="false"
            :show-center-play-btn="false"
            :show-fullscreen-btn="false"
            :show-background-playback-button="false"
            @play="onPlay"
            @pause="onPause"
            @loadedmetadata="loadedmetadata"
          />
          <!-- #endif -->
          <!-- #ifndef APP-PLUS -->
          <video
            v-show="isImageLoaded"
            id="rewardVideo"
            class="videoType"
            :style="data.coverStyle"
            :src="data.videoSrc"
            :object-fit="data.objectFit"
            :autoplay="false"
            loop
            :poster="data.coverImg"
            :controls="true"
            :show-center-play-btn="false"
            :show-fullscreen-btn="false"
            :show-background-playback-button="false"
            @play="onPlay"
            @pause="onPause"
            @loadedmetadata="loadedmetadata"
          ></video>
          <!-- #endif -->
          <view class="video-controls w-100 h-100">
            <view
              class="video-controls tn-flex-center-center tn-flex-column"
              v-show="isImageLoaded && !isPlaying"
            >
              <image
                class="play-icon"
                :src="`${$staticPath.common}/video-play-iocn.png`"
              ></image>
              <image
                class="play-img mt-24"
                mode="widthFix"
                :src="data.playAccessUrl"
              ></image>
            </view>
          </view>
        </view>
        <image
          v-else
          class="imageType"
          mode="widthFix"
          :src="data.imageSrc"
        ></image>
        <view :style="data.textBoxStyle" class="mx-40 my-30">
          <view
            v-if="data.title"
            :style="data.titleStyle"
            class="font-size-30 font-weight-500 font-color-v89"
            >{{ data.title }}</view
          >
          <view
            v-if="data.tips"
            :style="data.tipsStyle"
            class="font-size-24 font-weight-400 font-color-v90 mt-16"
            >{{ data.tips }}</view
          >
        </view>
        <image
          class="guide-img"
          :style="data.btnStyle"
          hover-class="hover-class"
          @click="handleClick"
          mode="widthFix"
          :src="data.btnImg"
        ></image>
      </view>
    </view>
  </tn-popup>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "@/store/user.js";
// API 调用已移除 - rewardPopup
import usePositionJump from "@/hooks/usePostionJump";
import useGuide from "@/store/guide.js";
const { proxy } = getCurrentInstance();

const { handleJump } = usePositionJump();
const { UPDATA_USER_INFO } = useUserStore();
const { updataShowReward } = useGuide();
const rewardVideoRef = ref(null);
const visible = ref(false);
const videoContext = ref(null);
const isPlaying = ref(false);
const controls = ref(true);
const isImageLoaded = ref(false);
const data = ref({});

const init = () => {
  rewardPopup().then((res) => {
    const record = res.data.rewardPopup.record;
    data.value = JSON.parse(record || "{}");
    if (data.value && data.value.visible) {
      visible.value = true;
    }
  });
};

const handleClick = () => {
  visible.value = false;
  const params = {
    targetType: data.value.targetType,
    targetUrl: data.value.targetUrl,
  };
  // console.log("跳转参数", params);
  handleJump(params);
};

// 图片加载完成回调
const onImageLoad = () => {
  isImageLoaded.value = true;
};

const handleClose = () => {
  UPDATA_USER_INFO("isNew", false);
  updataShowReward(false);
  visible.value = false;
};

const showVideo = ref(false);
const loadedmetadata = (e) => {
  showVideo.value = true;
};

// 切换播放状态
const togglePlay = () => {
  videoContext.value = uni.createVideoContext("rewardVideo", proxy);
  if (!videoContext.value) return;
  if (isPlaying.value) {
    // #ifndef APP-PLUS
    videoContext.value.pause();
    isPlaying.value = false;
    // #endif
    // #ifdef APP-PLUS
    // 暂停视频
    onPause();
    rewardVideoRef.value?.pause();
    // #endif
  } else {
    // #ifndef APP-PLUS
    videoContext.value.play();
    isPlaying.value = true;
    // #endif
    // #ifdef APP-PLUS
    // 播放视频
    onPlay();
    rewardVideoRef.value?.play();
    // #endif
  }
};

// 视频播放事件
const onPlay = () => {
  console.log("视频播放", isPlaying.value);
  isPlaying.value = true;
};

// 视频暂停事件
const onPause = () => {
  console.log("视频暂停", isPlaying.value);
  isPlaying.value = false;
};

watch(
  () => isPlaying.value,
  (val) => {
    controls.value = val;
  }
);
const open = () => {
  init();
};

defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
.rewardPoint {
  .rewardPoint-bg {
    .bg-img {
      width: 657rpx;
      position: relative;
    }
    .close-icon {
      z-index: 1001;
      top: 21rpx;
      right: 21rpx;
      & > image {
        width: 46rpx;
        height: 46rpx;
      }
    }
    .cover-tip-img {
      z-index: 1000;
      height: 80rpx;
      top: 16rpx;
      left: 16rpx;
    }
  }
  .rewardPoint-content {
    top: 6rpx;
    .videoType {
      width: 644rpx;
      height: 644rpx;
      border-radius: 42rpx 42rpx 0 0;
      transform: translateY(0);
      position: relative;
    }
    .imageType {
      width: 644rpx;
      height: 644rpx;
    }
    .video-controls {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .play-icon {
        width: 97rpx;
        height: 97rpx;
      }
      .play-img {
        width: 193rpx;
      }
    }
    .guide-img {
      width: 577rpx;
      display: block;
      margin: auto;
      height: auto;
    }
  }
}
</style>

<!--
// const data = {
//   visible: true,
//   direction: "bottom",
//   customClass: "mb-154",
//   customStyle: { marginBottom: "90rpx" },
//   bgImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/d31df7033f514246a810cd9f5c36bfaa-1760067284232.png", //背景图
//   bgStyle: { width: "657rpx" },
//   videoSrc:
//     "https://minio-api.kuaifuinfo.com/mo-uat/upload/20250930/野外骑老虎-1759196631053.mp4",
//   playAccessUrl:
//     "https://minio-api.kuaifuinfo.com/mo-uat/upload/20250917/点击播放@2x-1758079192371.png",
//   imageSrc: "",
//   coverImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/7bd118ba7fd44a8d910cafe8b75997bd-1760059484557.png",
//   coverTipImg:
//     "https://minio-api.kuaifuinfo.com/mo-uat/upload/20251010/今日推荐@2x-1760058881002.png",
//   coverTipImgStyle: { height: "80rpx", top: "16rpx", left: "16rpx" },
//   showCloseBtn: true,
//   closeBtnSrc:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/2e74d1f1cee84bd787207ae01617bfd8-1760066143293.png",
//   coverStyle: {},
//   textBoxStyle: { textAlign: "center" },
//   title: "创作、动画、演绎、灵感跃于眼前",
//   titleStyle: {},
//   tips: "",
//   tipsStyle: {},
//   btnImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/e0dfb35439044d9e931b93b6b836a3b0-1760062140007.png",
//   btnStyle: {},
//   targetType: "1",
//   targetUrl:
//     "/playPages/index/index?sc=aiShoutMaiService&si=1&t=AI喊麦&tm=340&at=photoTextToVideo&toPage=detail",
// };

// const data = {
//   visible: true, //是否显示
//   direction: "bottom",
//   customClass: "mb-154",
//   customStyle: { marginBottom: "90rpx" },
//   bgImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251009/593bf57fcc6c424881c58b9ec405a6c8-1760006039647.png", //背景图
//   bgStyle: { width: "657rpx" },
//   videoSrc:
//     "",
//   playAccessUrl:
//     "",
//   imageSrc:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/c43b85e2001b411eafe5e851157ae1c1-1760065905695.png",
//   coverImg:
//     "",
//   coverTipImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/c05699e4e67244828b6de3610d8e2cc3-1760067476518.png",
//   coverTipImgStyle: { height: "80rpx", top: "16rpx", left: "16rpx" },
//   showCloseBtn: true,
//   closeBtnSrc:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/2e74d1f1cee84bd787207ae01617bfd8-1760066143293.png",
//   coverStyle: {},
//   textBoxStyle: { textAlign: "left" },
//   title: "卡通风格",
//   titleStyle: {},
//   tips: "上传图片解锁你的卡通形象",
//   tipsStyle: {},
//   btnImg:
//     "https://kfbxpic.kuaifuinfo.com/upload/20251010/e0dfb35439044d9e931b93b6b836a3b0-1760062140007.png",
//   btnStyle: {},
//   targetType: "1",
//   targetUrl:
//     "/playPages/index/index?sc=aiShoutMaiService&si=1&t=AI喊麦&tm=340&at=photoTextToVideo&toPage=detail",
// }; 
-->
