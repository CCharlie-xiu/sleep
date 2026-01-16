/**
 * 文本动画 Hook
 * 处理名称和描述的动画切换效果
 */
export function useTextAnimation() {
  let animateTimeouts = []
  let animateFrame = null

  /**
   * 动画文本切换
   * @param {Array} pairs - 文本对数组，格式: [{ el: HTMLElement, text: string }, ...]
   */
  const animateTexts = (pairs) => {
    // 清理之前的动画
    animateTimeouts.forEach((t) => clearTimeout(t))
    animateTimeouts = []
    if (animateFrame) cancelAnimationFrame(animateFrame)
    animateFrame = null

    // 开始淡出
    pairs.forEach(({ el }) => {
      el.classList.remove('out', 'in', 'enter')
      void el.offsetHeight // 触发重排
      el.classList.add('out')
    })

    // 300ms 后开始淡入
    animateTimeouts.push(
      setTimeout(() => {
        pairs.forEach(({ el, text }) => {
          el.textContent = text
          el.classList.remove('out')
          el.classList.add('enter')
        })

        animateFrame = requestAnimationFrame(() => {
          pairs.forEach(({ el }) => {
            el.classList.remove('enter')
            el.classList.add('in')
          })
          animateTimeouts.push(
            setTimeout(() => {
              animateTimeouts = []
              animateFrame = null
            }, 500)
          )
        })
      }, 300)
    )
  }

  /**
   * 清理所有动画
   */
  const cleanup = () => {
    animateTimeouts.forEach((t) => clearTimeout(t))
    animateTimeouts = []
    if (animateFrame) cancelAnimationFrame(animateFrame)
    animateFrame = null
  }

  return {
    animateTexts,
    cleanup,
  }
}

