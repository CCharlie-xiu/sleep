<style scoped>
.kf-video {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<template>
  <view class="kf-video">
    <!-- APP 端 -->
    <!-- 视频地址必须是网络地址，不可以是本地地址。 -->
    <!-- #ifdef APP-PLUS -->
    <DomVideoPlayer ref="videoRef" v-bind="$attrs" />
    <!-- #endif -->

    <!-- 非 APP（H5/小程序） -->
    <!-- #ifndef APP-PLUS -->
    <video
      ref="videoRef"
      :id="id"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :controls="controls"
      :playsinline="playsinline"
      :src="src"
      :poster="poster"
      :width="width"
      :height="height"
      :initial-time="initialTime"
      :duration="duration"
      :direction="direction"
      :show-center-play-btn="showCenterPlayBtn"
      :enable-play-gesture="enablePlayGesture"
      :show-background-playback-button="show-background-playback-button"
      :object-fit="objectFit"
      :title="title"
      @play="$emit('play', $event)"
      @pause="$emit('pause', $event)"
      @ended="$emit('ended', $event)"
      @timeupdate="$emit('timeupdate', $event)"
      @loadedmetadata="$emit('loadedmetadata', $event)"
      @loadeddata="$emit('loadeddata', $event)"
      @error="$emit('error', $event)"
      class="video-wrapper"
    ></video>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { onHide, onShow } from '@dcloudio/uni-app'
import DomVideoPlayer from './component/DomVideoPlayer.vue'

const props = defineProps({
  needPause: {
    type: Boolean,
    default: true
  },
  needPlay: {
    type: Boolean,
    default: true
  },
  // #ifndef APP-PLUS
  // 播放控制
  id: { type: String, default: '' },
  autoplay: { type: Boolean, default: false },
  loop: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  controls: { type: Boolean, default: true },
  playsinline: { type: Boolean, default: true },

  // 视频源
  src: { type: String, required: true },
  poster: { type: String, default: '' },

  // 尺寸
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: 'auto' },

  // 播放进度 / 缓冲
  initialTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },

  // 其他属性
  direction: { type: Number, default: 0 },
  showCenterPlayBtn: { type: Boolean, default: true },
  showBackgroundPlaybackButton: { type: Boolean, default: true },
  enablePlayGesture: { type: Boolean, default: false },
  objectFit: { type: String, default: 'contain' },
  title: { type: String, default: '' }
  // #endif
})

const videoRef = ref(null)

const play = () => {
  // APP 环境
  // #ifdef APP-PLUS
  videoRef.value?.play && videoRef.value.play()
  // #endif

  // 非 APP 环境（H5 / 小程序）
  // #ifndef APP-PLUS
  videoRef.value?.play()
  // #endif
}

const pause = () => {
  // APP 环境
  // #ifdef APP-PLUS
  videoRef.value?.pause && videoRef.value.pause()
  // #endif

  // 非 APP 环境（H5 / 小程序）
  // #ifndef APP-PLUS
  videoRef.value?.pause()
  // #endif
}

onHide(() => {
  if (props.needPause) {
    pause()
  }
})

onShow(() => {
  if (props.needPlay) {
    play()
  }
})


defineExpose({
  videoRef,
  play,
  pause
})
</script>
