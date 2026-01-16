<template>
  <view class="app rela flex flex-col h-100" :style="{ background: currentBg, transition: 'background 0.6s' }">
    <view class="top-hint text-center font-size-10 pt-16" style="color: var(--text-sub); letter-spacing: 3px">
      上下滑动切换声音
    </view>

    <view
      :class="['countdown-container abso flex flex-col items-center z-10', { show: timerVisible }]"
      style="top: 145px; left: 50%; transform: translateX(-50%); opacity: 0; transition: opacity 0.5s ease; pointer-events: none"
    >
      <text class="countdown-time font-size-52 font-weight-800" style="color: var(--text-main); font-variant-numeric: tabular-nums; letter-spacing: -1px">
        {{ countdownTimeDisplay }}
      </text>
      <text class="countdown-label font-size-11" style="color: var(--accent-color); letter-spacing: 3px; margin-top: -2px; transition: color 0.6s">
        REMAINING TIME
      </text>
    </view>

    <view class="recommend-section mt-18">
      <view class="recommend-title font-size-13 mb-10 px-20" style="color: var(--text-sub)">为你推荐</view>
      <view class="horizational overflow-auto h-72 flex items-end px-20" style="scrollbar-width: none">
        <view class="horizontal-scroll flex" style="gap: 12px; scrollbar-width: none">
          <view
            v-for="(category, index) in recommendList"
            :key="index"
            :class="['recommend-card flex items-end h-56 p-10', { active: activeCategory === index }]"
            style="flex: 0 0 145px; background: var(--card-bg); border-radius: 60% 60% 20% 20% / 20% 60% 20% 60%; transition: all 0.3s ease-in-out; gap: 8px"
            @click="handleCategoryClick(index, category)"
          >
            <view class="card-icon w-45 h-56 flex-shrink-0 flex items-center justify-center font-size-20" style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; background: linear-gradient(to top, transparent, #f0f8ff 30%, #f0f8ff)">
              {{ getCategoryIcon(index) }}
            </view>
            <view class="card-text font-size-14" style="color: var(--text-main); line-height: 56px">{{ category.name }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="info-panel mt-60 px-30" style="pointer-events: none">
      <text :style="{ color: currentAccent, transition: 'color 0.6s' }">● 正在播放</text>
      <view
        :class="['current-name font-size-48 font-weight-800 fade-text', textAnimationState.nameClass]"
        style="color: var(--text-sub); transition-duration: 0.35s"
        ref="curNameRef"
      >
        {{ currentSound?.name || '' }}
      </view>
      <view
        :class="['current-desc font-size-13 fade-text', textAnimationState.descClass]"
        style="margin-top: 6px; color: var(--text-sub); max-width: 240px; line-height: 1.4; transition-duration: 0.35s; transition-delay: 0.08s"
        ref="curDescRef"
      >
        {{ currentSound?.desc || '' }}
      </view>
    </view>

    <view
      class="list-viewport flex justify-end pr-20 h-520 mt-20"
      style="mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)"
      ref="listViewportRef"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <view class="sound-list w-85" style="pointer-events: auto; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform" ref="soundListRef">
        <view
          v-for="(sound, index) in sounds"
          :key="index"
          :class="[
            'sound-item flex items-center mb-14 rela',
            {
              active: index === currentIndex,
              preactive: index === currentIndex - 1,
              nextactive: index === currentIndex + 1,
            },
          ]"
          :style="index === currentIndex ? { backgroundImage: `url(${sound.imgUrl})`, background: 'rgba(255,255,255,0.12)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 1, transform: 'scale(1.05)', border: '1px solid var(--accent-color)', color: '#fff', right: '20px' } : { background: 'var(--card-bg)', opacity: 0.25, transform: 'scale(0.92)' }"
          style="border-radius: 12px; padding: 12px 15px; gap: 12px; transition: 0.45s"
          @click="handleItemClick(index)"
        >
          <view class="vinyl w-38 h-38 flex justify-center items-center border-radius-50per" style="background: #111"></view>
          <view class="title font-size-14">{{ String(index + 1).padStart(2, '0') }} {{ sound.name }}</view>
          <view class="wave-view flex-1 h-18 flex items-center" style="gap: 3px">
            <span
              v-for="(wave, waveIndex) in getWaveHeights(index)"
              :key="waveIndex"
              class="flex-1"
              :style="{ height: wave, background: index === currentIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)', transition: '0.3s' }"
            ></span>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-controls abso left-0 right-0 bottom-40 flex justify-center items-center">
      <view class="setting-bar-left flex flex-col items-center gap-20 font-size-14 abso bottom-0" style="right: 25px; color: var(--text-sub)">
        <view class="timer-badge font-size-10" style="color: var(--text-sub); letter-spacing: 1px">甜菜.风铃科技™</view>
      </view>

      <view
        :class="['play-btn w-68 h-68 flex justify-center items-center border-radius-50per', { playing: isPlaying }]"
        style="background: var(--accent-color); box-shadow: 0 10px 25px rgba(0,0,0,0.3); transition: transform 0.2s, background 0.6s"
        @click="handlePlayClick"
      >
        <view class="play-icon"></view>
        <view class="pause-icon"></view>
      </view>

      <view class="setting-bar abso bottom-0 flex flex-col items-center gap-12 w-80" style="left: 25px">
        <view
          class="timer-container rela w-30 h-180 flex justify-center"
          style="touch-action: none"
          ref="timerContainerRef"
          @touchstart="handleTimerStart"
          @touchmove="handleTimerMove"
          @touchend="handleTimerEnd"
        >
          <view
            class="timer-tooltip abso"
            ref="timerTooltipRef"
            :style="{ bottom: `${timerProgressPercent}%`, transform: 'translateY(50%)', right: '-68px', background: 'var(--accent-color)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'bottom 0.3s cubic-bezier(0.25,0.1,0.25,1), background 0.6s' }"
          >
            {{ timerTooltipText }}
          </view>
          <view class="timer-track w-6 h-100 rela overflow-hidden border-radius-10" style="background: rgba(255,255,255,0.1)">
            <view
              class="timer-progress abso bottom-0 w-100"
              ref="timerProgressRef"
              :style="{ height: `${timerProgressPercent}%`, background: 'linear-gradient(to top, rgba(255,255,255,0.1), var(--accent-color))', transition: 'height 0.3s cubic-bezier(0.25,0.1,0.25,1)' }"
            ></view>
          </view>
          <view
            class="timer-handle abso w-20 h-20 border-radius-50per z-10"
            ref="timerHandleRef"
            :style="{ left: '50%', bottom: `${timerProgressPercent}%`, transform: 'translate(-50%, 50%)', background: '#fff', border: '4px solid #111', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', transition: 'bottom 0.3s cubic-bezier(0.25,0.1,0.25,1)' }"
          ></view>
        </view>
        <view class="timer-badge font-size-10 mt-12" style="color: var(--text-sub); letter-spacing: 1px" ref="timerBadgeRef">{{ timerBadgeText }}</view>
      </view>
    </view>

    <view
      class="momentBackText abso h-100v w-200 flex justify-center"
      style="right: -60px; text-align: center; font-size: 120px; font-weight: 600; user-select: none; pointer-events: none; color: var(--text-sub); letter-spacing: 1px; margin-bottom: 12px; writing-mode: vertical-rl; text-orientation: upright; -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to left, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)"
      ref="momentBackTextRef"
    >
      <text
        v-for="(char, idx) in momentBackTextChars"
        :key="idx"
        class="moment-char block"
        :style="{ '--char-index': idx, opacity: 0, transform: 'translateX(60px)', transition: 'opacity 0.1s ease, transform 0.6s cubic-bezier(0.4,0,0.2,1)' }"
      >
        {{ char }}
      </text>
    </view>
    <view
      :class="['blur-bg-container abso overflow-hidden z-2', { show: hasBackground }]"
      style="top: -10%; left: -10%; width: 120%; height: 120%; transition: opacity 1.5s ease; opacity: 0"
      ref="blurContainerRef"
    >
      <image :src="currentSound?.imgUrl || ''" class="blur-bg w-100 h-100" mode="aspectFill"></image>
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
    updateSounds(allList)
    momentBackTextChars.value = []
    return
  }

  // 切换到分类列表
  activeCategory.value = index
  updateSounds(category.keyvalue)
  // 显示背景文字
  momentBackTextChars.value = category.name.split('')
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
  if (!soundListRef.value) return

  const ITEM_HEIGHT = 78
  const CENTER_OFFSET = 2
  const offset = (currentIndex.value - CENTER_OFFSET) * ITEM_HEIGHT

  // 在 uni-app 中，需要通过 $el 访问 DOM
  const listEl = soundListRef.value.$el || soundListRef.value
  if (listEl) {
    listEl.style.transform = `translateY(${-offset}px)`
  }

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

  // 更新主题颜色
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--bg-color', s.bg)
    document.documentElement.style.setProperty('--accent-color', s.accent)
  }

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
:root {
  --bg-color: #2d1b1b;
  --accent-color: #ff8a65;
  --text-main: rgba(255, 255, 255, 0.65);
  --text-sub: rgba(255, 255, 255, 0.55);
  --card-bg: rgba(255, 255, 255, 0.08);
  --transition: 0.6s;
}

.app {
  height: calc(100vh - var(--nav-bar-height));
  z-index: 0;
}

.countdown-container.show {
  opacity: 1 !important;
}

.horizational::-webkit-scrollbar,
.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.recommend-card.active {
  transform: scale(1.05);
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40% !important;
}

.sound-item {
  &.preactive {
    transform: scale(1) !important;
    right: 12px !important;
  }

  &.nextactive {
    opacity: 0.8 !important;
    transform: scale(1) !important;
    right: 12px !important;
  }
}

.vinyl::after {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  transition: background 0.6s;
}

.play-btn:active {
  transform: scale(0.9);
}

.play-btn.playing .play-icon {
  display: none;
}

.play-btn.playing .pause-icon {
  display: block;
}

.timer-tooltip::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 6px solid var(--accent-color);
  transition: border-right-color 0.6s;
}

.fade-text {
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);

  &.out {
    opacity: 0;
    transform: translateX(-152px);
  }

  &.in {
    opacity: 1;
    transform: translateY(0);
  }

  &.enter {
    opacity: 0;
    transform: translateX(152px);
  }
}

.moment-char:nth-child(n) {
  animation: fadeInChar 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--char-index, 0) * 0.1s);
}

@keyframes fadeInChar {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.blur-bg-container.show {
  opacity: 1 !important;
}

/* 图标 */
.play-icon {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12px 0 12px 20px;
  border-color: transparent transparent transparent #fff;
  margin-left: 5px;
}

.pause-icon {
  display: none;
  width: 18px;
  height: 24px;
  border-left: 6px solid #fff;
  border-right: 6px solid #fff;
}
</style>

