import { ref } from 'vue'

/**
 * ASMR 音频播放管理 Hook
 * 处理音频播放、切换、淡入淡出等逻辑
 */
export function useAsmrAudio(asmrMap) {
  const isPlaying = ref(false)
  const audio = new Audio()
  audio.loop = false
  audio.volume = 0.8

  let currentList = []
  let currentAudioIndex = 0
  let currentType = null
  let isDragging = false

  /**
   * 播放 ASMR
   * @param {string} type - 音频类型
   */
  const playAsmr = (type) => {
    if (!asmrMap[type]) return
    if (type !== currentType) {
      currentType = type
      currentList = asmrMap[type]
      currentAudioIndex = 0
    }
    playCurrent()
  }

  /**
   * 播放当前音频
   */
  const playCurrent = () => {
    const src = currentList[currentAudioIndex]
    if (!src) return
    audio.src = src
    audio.currentTime = 0
    audio.play().catch((err) => console.warn('播放失败', err))
  }

  /**
   * 淡入淡出切换到下一首
   */
  const fadeToNext = () => {
    let v = audio.volume
    const fadeOut = setInterval(() => {
      v -= 0.05
      if (v <= 0) {
        clearInterval(fadeOut)
        audio.volume = 0
        currentAudioIndex = (currentAudioIndex + 1) % currentList.length
        playCurrent()
        fadeIn()
      } else {
        audio.volume = v
      }
    }, 50)
  }

  /**
   * 淡入效果
   */
  const fadeIn = () => {
    let v = 0
    const fadeInInterval = setInterval(() => {
      v += 0.05
      if (v >= 0.8) {
        audio.volume = 0.8
        clearInterval(fadeInInterval)
      } else {
        audio.volume = v
      }
    }, 50)
  }

  // 播放结束自动切换
  audio.addEventListener('ended', () => {
    if (!isPlaying.value || isDragging) return
    fadeToNext()
  })

  /**
   * 切换播放/暂停
   */
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      // 播放逻辑由外部调用 playAsmr
    } else {
      audio.pause()
    }
  }

  /**
   * 暂停播放
   */
  const pause = () => {
    isPlaying.value = false
    audio.pause()
  }

  /**
   * 设置拖拽状态（用于防止拖拽时自动切换）
   * @param {boolean} dragging - 是否正在拖拽
   */
  const setDragging = (dragging) => {
    isDragging = dragging
  }

  // 组件卸载时清理
  const cleanup = () => {
    audio.pause()
    audio.src = ''
    isPlaying.value = false
  }

  return {
    isPlaying,
    audio,
    playAsmr,
    togglePlay,
    pause,
    setDragging,
    cleanup,
  }
}

