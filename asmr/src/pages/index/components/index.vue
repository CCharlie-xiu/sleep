<template>
  <view class="app" :style="{ '--bg-color': currentBg, '--accent-color': currentAccent }">
    <view class="w-full min-h-168" :style="{ height: 'calc(var(--nav-bar-height))' }">1</view>
    <view class="top-hint text-center fs-20 pt-32">上下滑动切换声音</view>

    <view :class="['countdown-container absolute top-290 flex items-center z-10', { show: timerVisible }]">
      <text class="countdown-time fs-104">{{ countdownTimeDisplay }}</text>
      <text class="countdown-label fs-22">REMAINING TIME</text>
    </view>

    <view class="mt-18">
      <view class="recommend-title fs-26 mb-20 px-40">为你推荐</view>
      <view class="horizational h-144 flex px-40">
        <view class="horizontal-scroll flex">
          <view
            v-for="(category, index) in recommendList"
            :key="index"
            :class="['recommend-card flex h-112 p-10', { active: activeCategory === index }]"
            @click="handleCategoryClick(index, category)"
          >
            <view class="card-icon w-90 h-112 flex items-center justify-center fs-40">{{ getCategoryIcon(index) }}</view>
            <view class="card-text fs-28">{{ category.name }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="info-panel mt-64 px-60">
      <text :style="{ color: currentAccent, transition: 'color 0.6s' }">● 正在播放</text>
      <view
        :class="['current-name fs-96', 'fade-text', textAnimationState.nameClass]"
        ref="curNameRef"
      >
        {{ currentSound?.name || '' }}
      </view>
      <view
        :class="['current-desc fs-26 mt-12', 'fade-text', textAnimationState.descClass]"
        ref="curDescRef"
      >
        {{ currentSound?.desc || '' }}
      </view>
    </view>

    <view class="list-viewport flex pr-20 h-720" ref="listViewportRef" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <view class="sound-list" ref="soundListRef" :style="{ transform: `translateY(${listTransform}px)` }">
        <view
          v-for="(sound, index) in sounds"
          :key="index"
          :class="[
            'sound-item rd-24 py-24 px-30 flex items-center mb-28 relative',
            {
              active: index === currentIndex,
              preactive: index === currentIndex - 1,
              nextactive: index === currentIndex + 1,
            },
          ]"
          :style="index === currentIndex ? { backgroundImage: `url(${sound.imgUrl})` } : {}"
          @click="handleItemClick(index)"
        >
          <view class="vinyl w-76 h-76 flex items-center justify-center"></view>
          <view class="title px-12">{{ String(index + 1).padStart(2, '0') }} {{ sound.name }}</view>
          <view class="wave-view">
            <view
              v-for="(wave, waveIndex) in getWaveHeights(index)"
              :key="waveIndex"
              class="wave-bar"
              :style="{ height: wave }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-controls absolute bottom-80 flex items-center justify-center left-0 right-0">
      <view class="setting-bar-left">
        <view class="timer-badge"><!-- 甜菜.风铃科技™ --></view>
      </view>

      <view :class="['play-btn w-136 h-136 flex items-center justify-center', { playing: isPlaying }]" @click="handlePlayClick">
        <view class="play-icon"></view>
        <view class="pause-icon"></view>
      </view>

      <view class="setting-bar absolute left-0 bottom-0 flex w-160 items-center">
        <view class="timer-container" ref="timerContainerRef" @touchstart="handleTimerStart" @touchmove="handleTimerMove" @touchend="handleTimerEnd">
          <view class="timer-tooltip" ref="timerTooltipRef">{{ timerTooltipText }}</view>
          <view class="timer-track">
            <view class="timer-progress" ref="timerProgressRef" :style="{ height: `${timerProgressPercent}%` }"></view>
          </view>
          <view class="timer-handle" ref="timerHandleRef" :style="{ bottom: `${timerProgressPercent}%` }"></view>
        </view>
        <view class="timer-badge" ref="timerBadgeRef">{{ timerBadgeText }}</view>
      </view>
    </view>

    <view class="momentBackText" ref="momentBackTextRef">
      <view
        v-for="(char, idx) in momentBackTextChars"
        :key="idx"
        class="moment-char"
        :style="{ animationDelay: `${idx * 0.1}s` }"
      >
        {{ char }}
      </view>
    </view>
    <view :class="['blur-bg-container', { show: hasBackground }]" ref="blurContainerRef">
      <image :src="currentSound?.imgUrl || ''" class="blur-bg" mode="aspectFill"></image>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAsmrData } from '@/hooks/useAsmrData'
import { useAsmrAudio } from '@/hooks/useAsmrAudio'
import { useTextAnimation } from '@/hooks/useTextAnimation'
import { useRecommend } from '@/hooks/useRecommend'
import { useTimer } from '@/hooks/useTimer'

// 初始化 hooks
const { sounds, allList, recommendList, asmrMap, currentIndex, updateSounds } = useAsmrData()
const { isPlaying, playAsmr, togglePlay, pause, setDragging } = useAsmrAudio(asmrMap)
const { cleanup: cleanupAnimation } = useTextAnimation()
const { activeCategory } = useRecommend()
const {
  timerVisible,
  formatTime,
  handleTimerDrag,
  startCountdown,
  stopCountdown,
  cleanup: cleanupTimer,
} = useTimer()

// DOM 引用
const curNameRef = ref(null)
const curDescRef = ref(null)
const soundListRef = ref(null)
const listViewportRef = ref(null)
const timerContainerRef = ref(null)
const timerHandleRef = ref(null)
const timerProgressRef = ref(null)
const timerTooltipRef = ref(null)
const timerBadgeRef = ref(null)
const momentBackTextRef = ref(null)
const blurContainerRef = ref(null)

// 计算属性
const currentSound = computed(() => sounds.value[currentIndex.value] || null)
const currentAccent = computed(() => currentSound.value?.accent || '#FF8A65')
const currentBg = computed(() => currentSound.value?.bg || '#2D1B1B')

const countdownTimeDisplay = ref('00:00')
const timerProgressPercent = ref(0)
const timerTooltipText = ref('关闭')
const timerBadgeText = ref('定时关闭')
const hasBackground = ref(false)
const listTransform = ref(0)

// 文本动画状态
const textAnimationState = ref({
  nameClass: '',
  descClass: '',
})

// 背景文字字符
const momentBackTextChars = ref([])

// 波浪高度缓存
const waveHeightsCache = ref(new Map())

// 触摸相关
let touchStartY = 0
let isDraggingTimer = false

// 获取分类图标
const getCategoryIcon = (index) => {
  const icons = ['🔥', '🌧', '📖', '🌌', '🧩']
  return icons[index] || '🎵'
}

// 获取波浪高度
const getWaveHeights = (index) => {
  if (!waveHeightsCache.value.has(index)) {
    const heights = Array.from({ length: 48 }, () => `${30 + Math.random() * 60}%`)
    waveHeightsCache.value.set(index, heights)
  }
  return waveHeightsCache.value.get(index)
}

// 处理分类点击
const handleCategoryClick = (index, category) => {
  const wasActive = activeCategory.value === index

  if (wasActive) {
    // 返回全部列表
    activeCategory.value = null
    updateSounds(allList)
    momentBackTextChars.value = []
    return
  }

  // 切换到分类列表
  activeCategory.value = index
  updateSounds(category.keyvalue)
  // 显示背景文字
  momentBackTextChars.value = category.name.split('')
  console.log(momentBackTextChars.value)
}

// 处理列表项点击
const handleItemClick = (index) => {
  currentIndex.value = index
  update()
  if (!isPlaying.value) {
    togglePlay()
    if (isPlaying.value) {
      playAsmr(sounds.value[currentIndex.value].key)
    }
  }
}

// 处理播放按钮点击
const handlePlayClick = () => {
  togglePlay()
  if (isPlaying.value) {
    playAsmr(sounds.value[currentIndex.value].key)
  }
}

// 触摸事件处理
const handleTouchStart = (e) => {
  if (e.touches && e.touches[0]) {
    touchStartY = e.touches[0].clientY
  }
}

const handleTouchEnd = (e) => {
  if (!e.changedTouches || !e.changedTouches[0]) return

  const deltaY = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(deltaY) > 70) {
    const newIndex = (currentIndex.value + (deltaY > 0 ? 1 : -1) + sounds.value.length) % sounds.value.length
    currentIndex.value = newIndex
    update()
    if (isPlaying.value) {
      playAsmr(sounds.value[currentIndex.value].key)
    }
  }
}

// 定时器事件处理
const handleTimerStart = (e) => {
  isDraggingTimer = true
  setDragging(true)
  if (e.touches && e.touches[0]) {
    const mins = handleTimerDrag(
      e.touches[0].clientY,
      timerContainerRef.value?.$el || timerContainerRef.value,
      timerHandleRef.value?.$el || timerHandleRef.value,
      timerProgressRef.value?.$el || timerProgressRef.value,
      timerTooltipRef.value?.$el || timerTooltipRef.value,
      timerBadgeRef.value?.$el || timerBadgeRef.value
    )
    updateTimerUI(mins)
  }
}

const handleTimerMove = (e) => {
  if (!isDraggingTimer || !e.touches || !e.touches[0]) return
  const mins = handleTimerDrag(
    e.touches[0].clientY,
    timerContainerRef.value?.$el || timerContainerRef.value,
    timerHandleRef.value?.$el || timerHandleRef.value,
    timerProgressRef.value?.$el || timerProgressRef.value,
    timerTooltipRef.value?.$el || timerTooltipRef.value,
    timerBadgeRef.value?.$el || timerBadgeRef.value
  )
  updateTimerUI(mins)
}

const handleTimerEnd = (e) => {
  if (!isDraggingTimer) return
  isDraggingTimer = false
  setDragging(false)

  let mins = 0
  if (e.changedTouches && e.changedTouches[0]) {
    mins = handleTimerDrag(
      e.changedTouches[0].clientY,
      timerContainerRef.value?.$el || timerContainerRef.value,
      timerHandleRef.value?.$el || timerHandleRef.value,
      timerProgressRef.value?.$el || timerProgressRef.value,
      timerTooltipRef.value?.$el || timerTooltipRef.value,
      timerBadgeRef.value?.$el || timerBadgeRef.value
    )
  }

  startCountdown(mins, (timeStr) => {
    countdownTimeDisplay.value = timeStr
  }, () => {
    pause()
  })

  updateTimerUI(mins)
}

// 更新定时器 UI
const updateTimerUI = (mins) => {
  const timeSteps = [0, 3, 5, 15, 30]
  const stepIdx = timeSteps.indexOf(mins)
  if (stepIdx >= 0) {
    timerProgressPercent.value = (stepIdx / (timeSteps.length - 1)) * 100
    timerTooltipText.value = mins === 0 ? '关闭' : `${mins} 分钟`
    timerBadgeText.value = mins === 0 ? '定时关闭' : `定时 ${mins}min`
  }
}

// 更新列表状态
const updateListState = () => {
  const ITEM_HEIGHT = 78
  const CENTER_OFFSET = 2
  const offset = (currentIndex.value - CENTER_OFFSET) * ITEM_HEIGHT
  listTransform.value = -offset

  // 更新背景图片
  if (blurContainerRef.value && currentSound.value) {
    const containerEl = blurContainerRef.value.$el || blurContainerRef.value
    if (containerEl) {
      containerEl.style.opacity = '1'
      hasBackground.value = true
    }
  }
}

// 更新界面
const update = () => {
  const s = currentSound.value
  if (!s) return

  // 更新文本动画状态
  textAnimationState.value = {
    nameClass: 'out',
    descClass: 'out',
  }

  nextTick(() => {
    setTimeout(() => {
      textAnimationState.value = {
        nameClass: 'enter',
        descClass: 'enter',
      }
      requestAnimationFrame(() => {
        textAnimationState.value = {
          nameClass: 'in',
          descClass: 'in',
        }
      })
    }, 300)
  })

  updateListState()

  if (isPlaying.value) {
    playAsmr(s.key)
  }
}

// 监听索引变化
watch(currentIndex, () => {
  update()
})

// 初始化
onMounted(() => {
  nextTick(() => {
    // 初始化列表状态
    updateListState()
    update()
  })
})

// 清理
onUnmounted(() => {
  cleanupAnimation()
  cleanupTimer()
  pause()
})
</script>

<style lang="scss" scoped>
.app {
  --bg-color: #2d1b1b;
  --accent-color: #ff8a65;
  --text-main: rgba(255, 255, 255, 0.65);
  --text-sub: rgba(255, 255, 255, 0.55);
  --card-bg: rgba(255, 255, 255, 0.08);
  --transition: 0.6s;
  
  height: calc(100vh);
  background: var(--bg-color);
  transition: background var(--transition);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
  overflow: hidden;
}

/* 顶部倒计时区 */
.countdown-container {
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;

  &.show {
    opacity: 1;
  }
}

.countdown-time {
  fs-weight: 800;
  color: var(--text-main);
  fs-variant-numeric: tabular-nums;
  letter-spacing: -1px;
}

.countdown-label {
  color: var(--accent-color);
  letter-spacing: 3px;
  margin-top: -2px;
  transition: color var(--transition);
}

/* 顶部提示 */
.top-hint {
  color: var(--text-sub);
  letter-spacing: 3px;
}

.recommend-title {
  color: var(--text-sub);
}

.horizational {
  overflow: auto;
  align-items: flex-end;

  &::-webkit-scrollbar {
    display: none;
  }
}

.horizontal-scroll {
  gap: 12px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.recommend-card {
  flex: 0 0 145px;
  background: var(--card-bg);
  border-radius: 60% 60% 20% 20% / 20% 60% 20% 60%;
  align-items: flex-end;
  gap: 8px;
  transition: all 0.3s ease-in-out;

  &.active {
    transform: scale(1.05);
    transition: all 0.3s ease-in-out;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
}

.card-icon {
  flex-shrink: 0;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  background: linear-gradient(to top, transparent, #f0f8ff 30%, #f0f8ff);
}

.card-text {
  color: var(--text-main);
  line-height: 56px;
}

/* 信息区 */
.info-panel {
  pointer-events: none;
}

.current-name {
  font-weight: 800;
  color: var(--text-sub);
  transition-duration: 0.35s;
}

.current-desc {
  color: var(--text-sub);
  max-width: 240px;
  line-height: 1.4;
  transition-duration: 0.35s;
  transition-delay: 0.08s;
}

/* 声音列表 */
.list-viewport {
  justify-content: flex-end;
  transform: translateY(-40px);
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

.sound-list {
  width: 85%;
  pointer-events: auto;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.sound-item {
  background: var(--card-bg);
  opacity: 0.25;
  transform: scale(0.92);
  transition: 0.45s;

  &.active {
    opacity: 1;
    transform: scale(1.05);
    border: 1px solid var(--accent-color);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    right: 20px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  &.preactive {
    transform: scale(1);
    right: 12px;
  }

  &.nextactive {
    opacity: 0.8;
    transform: scale(1);
    right: 12px;
  }
}

.vinyl {
  background: #111;
  border-radius: 50%;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--accent-color);
    border-radius: 50%;
    transition: background 0.6s;
  }
}

.wave-view {
  flex: 1;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .wave-bar {
    flex: 1;
    min-height: 2px;
    background: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    margin-right: 3px;
    border-radius: 1px;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.active .wave-view .wave-bar {
  background: var(--accent-color);
}

.play-btn {
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, background 0.6s;

  &:active {
    transform: scale(0.9);
  }

  &.playing {
    .play-icon {
      display: none;
    }

    .pause-icon {
      display: block;
    }
  }
}

.setting-bar {
  flex-direction: column;
  gap: 12px;
}

.setting-bar-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
  font-size: 28rpx;
  color: var(--text-sub);
  position: absolute;
  right: 50rpx;
  bottom: 0rpx;
}

.timer-container {
  position: relative;
  width: 60rpx;
  height: 360rpx;
  display: flex;
  justify-content: center;
  touch-action: none;
}

.timer-track {
  width: 12rpx;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
}

.timer-progress {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.1), var(--accent-color));
  transition: height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.timer-handle {
  position: absolute;
  left: 50%;
  bottom: 0%;
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border: 8rpx solid #111;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  transition: bottom 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.timer-tooltip {
  position: absolute;
  right: -136rpx;
  bottom: 0%;
  background: var(--accent-color);
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 8px;
  font-size: 24rpx;
  font-weight: bold;
  transform: translateY(50%);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: bottom 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), background 0.6s;

  &::after {
    content: '';
    position: absolute;
    left: -20rpx;
    top: 50%;
    transform: translateY(-50%);
    border-top: 20rpx solid transparent;
    border-bottom: 20rpx solid transparent;
    border-right: 24rpx solid var(--accent-color);
    transition: border-left-color 0.6s;
  }
}

.timer-badge {
  font-size: 20rpx;
  color: var(--text-sub);
  letter-spacing: 4rpx;
  margin-top: 24rpx;
}

.fade-text {
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);

  &.out {
    opacity: 0;
    transform: translateX(-304rpx);
  }

  &.in {
    opacity: 1;
    transform: translateY(0);
  }

  &.enter {
    opacity: 0;
    transform: translateX(304rpx);
  }
}

.momentBackText {
  position: absolute;
  height: 100vh;
  width: 400rpx;
  right: -120rpx;
  text-align: center;
  font-size: 240rpx;
  font-weight: 600;
  user-select: none;
  pointer-events: none;
  color: var(--text-sub);
  letter-spacing: 2rpx;
  margin-bottom: 24rpx;
  writing-mode: vertical-rl;
  text-orientation: upright;
  display: flex;
  justify-content: center;
  -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0) 100%);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;

  .moment-char {
    display: block;
    opacity: 0;
    transform: translateX(120rpx);
    animation: fadeInChar 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

@keyframes fadeInChar {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.blur-bg-container {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  z-index: -2;
  overflow: hidden;
  transition: opacity 1.5s ease;
  opacity: 0;

  &.show {
    opacity: 1;
  }
}

.blur-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  -webkit-mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 20%, rgba(0, 0, 0, 0.2) 32%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 20%, rgba(0, 0, 0, 0.2) 32%, rgba(0, 0, 0, 0) 100%);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}

/* 图标 */
.play-icon {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 24rpx 0 24rpx 40rpx;
  border-color: transparent transparent transparent #fff;
  margin-left: 10rpx;
}

.pause-icon {
  display: none;
  width: 36rpx;
  height: 48rpx;
  border-left: 12rpx solid #fff;
  border-right: 12rpx solid #fff;
}
</style>

