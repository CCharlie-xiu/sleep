import { ref, nextTick } from 'vue'

/**
 * 推荐分类 Hook
 * 处理推荐卡片交互、分类切换等逻辑
 */
export function useRecommend() {
  const activeCategory = ref(null)
  const momentBackTextRef = ref(null)

  /**
   * 显示背景文字动画
   * @param {string} text - 要显示的文本
   */
  const showMomentBackText = (text) => {
    if (!momentBackTextRef.value) return

    const momentBackText = momentBackTextRef.value
    momentBackText.innerHTML = '' // 清空
    const chars = text.split('') // 分割成每个字符

    chars.forEach((ch, i) => {
      const span = document.createElement('span')
      span.innerText = ch
      span.style.display = 'block'
      span.style.opacity = 0
      span.style.transition = 'opacity 0.1s ease, transform 0.6s cubic-bezier(.4,0,.2,1)'
      span.style.transform = 'translateX(60px)' // 初始位置

      momentBackText.appendChild(span)

      // 延迟逐个显示
      setTimeout(() => {
        span.style.opacity = 1
        span.style.transform = 'translateY(0)'
      }, i * 100) // 每个字符延迟 100ms
    })
  }

  /**
   * 初始化推荐卡片
   * @param {Array} recommendCards - 推荐卡片元素数组
   * @param {Array} recommendList - 推荐列表数据
   * @param {Function} onCategoryChange - 分类切换回调
   */
  const initRecommendCards = (recommendCards, recommendList, onCategoryChange) => {
    recommendCards.forEach((card, i) => {
      card.addEventListener('click', function () {
        const wasActive = card.classList.contains('active')
        recommendCards.forEach((c) => c.classList.remove('active'))

        if (wasActive) {
          // 如果点击的是已激活的卡片，则取消激活，返回全部列表
          activeCategory.value = null
          onCategoryChange(null, null) // 传递 null 表示返回全部列表，由外部处理
          hideMomentBackText()
          return
        }

        // 激活当前卡片
        card.classList.add('active')
        activeCategory.value = i
        const categoryName = this.querySelector('.card-text').innerText
        showMomentBackText(categoryName)
        onCategoryChange(i, recommendList[i].keyvalue)
      })
      card.style.cursor = 'pointer'
    })
  }

  /**
   * 隐藏背景文字
   */
  const hideMomentBackText = () => {
    if (!momentBackTextRef.value) return
    const momentBackText = momentBackTextRef.value
    momentBackText.style.opacity = 0
    momentBackText.style.transform = 'translateX(60px)'
    momentBackText.style.transition = 'all 0.6s cubic-bezier(.4,0,.2,1)'
  }

  /**
   * 设置背景文字元素引用
   * @param {HTMLElement} el - DOM 元素
   */
  const setMomentBackTextRef = (el) => {
    momentBackTextRef.value = el
  }

  return {
    activeCategory,
    showMomentBackText,
    hideMomentBackText,
    initRecommendCards,
    setMomentBackTextRef,
  }
}

