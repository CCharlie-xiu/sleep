import { ref } from 'vue'

import type { NotifyOptions } from '../notify'

export const useNotify = () => {
  // notify的默认配置项
  const defaultOptions: NotifyOptions = {
    msg: '',
    type: 'primary',
    position: 'top',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    duration: 3000,
    iconName:'',
  }
  // notify的配置项
  const options = ref<NotifyOptions>({
    msg: '',
    type: 'primary',
    position: '',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    duration: 3000,
    iconName:'',
  })

  // 显示notify
  const isActive = ref(false)

  // 弹出notify通知
  const showNotify = (_options: NotifyOptions) => {
    Object.assign(options.value, defaultOptions, _options)
    isActive.value = true
    autoCloseNotify()
  }

  // 自动关闭弹框
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null
  const autoCloseNotify = () => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    autoCloseTimer = setTimeout(() => {
      isActive.value = false
    }, options.value.duration)
  }

  return {
    options,
    isActive,
    showNotify,
  }
}
