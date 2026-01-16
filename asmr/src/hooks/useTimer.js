import { ref } from 'vue'

/**
 * 定时器 Hook
 * 处理定时关闭、倒计时显示等逻辑
 */
export function useTimer() {
  const remainingTime = ref(0) // 剩余秒数
  const timerVisible = ref(false)
  const timeSteps = [0, 3, 5, 15, 30] // 定时器可选时间（分钟）

  let countdownInterval = null
  let onTimerEnd = null // 定时结束回调

  /**
   * 格式化时间显示
   * @param {number} seconds - 总秒数
   * @returns {string} 格式化的时间字符串 (MM:SS)
   */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  /**
   * 更新定时器 UI
   * @param {number} percent - 进度百分比 (0-100)
   * @param {number} mins - 分钟数
   * @param {HTMLElement} timerHandle - 滑块元素
   * @param {HTMLElement} timerProgress - 进度条元素
   * @param {HTMLElement} timerTooltip - 提示框元素
   * @param {HTMLElement} timerBadge - 标签元素
   */
  const updateTimerUI = (percent, mins, timerHandle, timerProgress, timerTooltip, timerBadge) => {
    if (timerHandle) timerHandle.style.bottom = `${percent}%`
    if (timerProgress) timerProgress.style.height = `${percent}%`
    if (timerTooltip) {
      timerTooltip.style.bottom = `${percent}%`
      timerTooltip.innerText = mins === 0 ? '关闭' : `${mins} 分钟`
    }
    if (timerBadge) timerBadge.innerText = mins === 0 ? '定时关闭' : `定时 ${mins}min`
  }

  /**
   * 处理定时器拖动
   * @param {number} clientY - 鼠标/触摸 Y 坐标
   * @param {HTMLElement} timerContainer - 定时器容器元素
   * @returns {number} 选中的分钟数
   */
  const handleTimerDrag = (clientY, timerContainer, timerHandle, timerProgress, timerTooltip, timerBadge) => {
    if (!timerContainer) return 0

    const rect = timerContainer.getBoundingClientRect()
    let percent = ((rect.bottom - clientY) / rect.height) * 100
    percent = Math.max(0, Math.min(100, percent))

    const stepIdx = Math.round((percent / 100) * (timeSteps.length - 1))
    const snapPercent = (stepIdx / (timeSteps.length - 1)) * 100
    const mins = timeSteps[stepIdx]

    updateTimerUI(snapPercent, mins, timerHandle, timerProgress, timerTooltip, timerBadge)
    return mins
  }

  /**
   * 开始倒计时
   * @param {number} minutes - 分钟数
   * @param {Function} onUpdate - 更新回调 (timeString) => void
   * @param {Function} onEnd - 结束回调 () => void
   */
  const startCountdown = (minutes, onUpdate, onEnd) => {
    clearInterval(countdownInterval)
    onTimerEnd = onEnd

    if (minutes === 0) {
      timerVisible.value = false
      remainingTime.value = 0
      if (onUpdate) onUpdate('00:00')
      return
    }

    remainingTime.value = minutes * 60
    timerVisible.value = true

    if (onUpdate) onUpdate(formatTime(remainingTime.value))

    countdownInterval = setInterval(() => {
      remainingTime.value--
      if (remainingTime.value <= 0) {
        clearInterval(countdownInterval)
        timerVisible.value = false
        remainingTime.value = 0
        if (onUpdate) onUpdate('00:00')
        if (onTimerEnd) onTimerEnd()
      } else {
        if (onUpdate) onUpdate(formatTime(remainingTime.value))
      }
    }, 1000)
  }

  /**
   * 停止倒计时
   */
  const stopCountdown = () => {
    clearInterval(countdownInterval)
    timerVisible.value = false
    remainingTime.value = 0
  }

  /**
   * 清理定时器
   */
  const cleanup = () => {
    clearInterval(countdownInterval)
    countdownInterval = null
    onTimerEnd = null
  }

  return {
    remainingTime,
    timerVisible,
    timeSteps,
    formatTime,
    updateTimerUI,
    handleTimerDrag,
    startCountdown,
    stopCountdown,
    cleanup,
  }
}

