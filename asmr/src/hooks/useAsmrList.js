import { ref, nextTick } from 'vue'

/**
 * ASMR 列表管理 Hook
 * 处理列表渲染、状态更新、滑动切换等逻辑
 */
export function useAsmrList() {
  const ITEM_HEIGHT = 78
  const CENTER_OFFSET = 2

  const itemEls = ref([])
  const listRef = ref(null)

  /**
   * 渲染列表
   * @param {Array} sounds - 声音列表
   * @param {Function} onItemClick - 点击回调
   * @returns {Array} DOM 元素数组
   */
  const renderList = (sounds, onItemClick) => {
    itemEls.value = []
    if (!listRef.value) return []

    sounds.forEach((s, i) => {
      const el = document.createElement('div')
      const waves = Array.from({ length: 48 })
        .map(() => `<span style="height:${30 + Math.random() * 60}%"></span>`)
        .join('')
      el.className = 'sound-item'
      el.innerHTML = `
        <div class="vinyl"></div>
        <div class="title">${String(i + 1).padStart(2, '0')} ${s.name}</div>
        <div class="wave-view">${waves}</div>
      `
      el.onclick = () => {
        onItemClick(i)
      }
      listRef.value.appendChild(el)
      itemEls.value.push(el)
    })

    return itemEls.value
  }

  /**
   * 更新列表状态（高亮当前项、调整位置等）
   * @param {number} index - 当前索引
   * @param {Array} sounds - 声音列表
   * @param {HTMLElement} blurBg - 背景图片元素
   * @param {HTMLElement} blurContainer - 背景容器元素
   */
  const updateListState = (index, sounds, blurBg = null, blurContainer = null) => {
    if (!listRef.value) return

    const offset = (index - CENTER_OFFSET) * ITEM_HEIGHT
    listRef.value.style.transform = `translateY(${-offset}px)`

    itemEls.value.forEach((el, i) => {
      el.style.backgroundImage = ``
      el.classList.remove('active', 'preactive', 'nextactive')
      if (i === index) {
        el.classList.add('active')
        el.style.backgroundImage = `url(${sounds[i].imgUrl})`
        if (blurBg) blurBg.src = sounds[i].imgUrl
        if (blurContainer) blurContainer.style.opacity = '1'
      } else if (i === index - 1) {
        el.classList.add('preactive')
      } else if (i === index + 1) {
        el.classList.add('nextactive')
      }
    })
  }

  /**
   * 处理滑动切换
   * @param {number} deltaY - Y 轴滑动距离
   * @param {number} currentIndex - 当前索引
   * @param {number} soundsLength - 列表长度
   * @returns {number} 新的索引
   */
  const handleSwipe = (deltaY, currentIndex, soundsLength) => {
    if (Math.abs(deltaY) > 70) {
      return (currentIndex + (deltaY > 0 ? 1 : -1) + soundsLength) % soundsLength
    }
    return currentIndex
  }

  /**
   * 设置列表容器引用
   * @param {HTMLElement} el - DOM 元素
   */
  const setListRef = (el) => {
    listRef.value = el
  }

  /**
   * 清空列表
   */
  const clearList = () => {
    if (listRef.value) {
      listRef.value.innerHTML = ''
    }
    itemEls.value = []
  }

  return {
    itemEls,
    listRef,
    renderList,
    updateListState,
    handleSwipe,
    setListRef,
    clearList,
  }
}

