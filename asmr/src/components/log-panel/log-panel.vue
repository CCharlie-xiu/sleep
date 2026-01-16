<template>
  <!-- 悬浮按钮（半隐藏 + 全显两种状态） -->
  <view
    v-if="state !== 'panel'"
    class="floating-btn"
    :class="{ 'half-hidden': state === 'hidden' }"
    @click="toggleState"
  >
    日志
  </view>

  <!-- 日志面板 -->
  <view v-if="state === 'panel'" class="log-panel">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="search-input-group">
        <text class="search-icon">🔍</text>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索日志内容..."
          class="search-input"
          @input="handleSearch"
        />
        <text 
          class="clear-icon" 
          v-if="searchKeyword" 
          @click="clearSearch"
        >×</text>
      </view>
      
      <view class="search-stats" v-if="searchKeyword">
        <text>找到 {{ filteredLogs.length }} 条结果</text>
        <view class="search-nav" v-if="filteredLogs.length > 0">
          <button @click="navigateResult(-1)" class="nav-btn">↑</button>
          <button @click="navigateResult(1)" class="nav-btn">↓</button>
        </view>
      </view>
    </view>

    <scroll-view 
      scroll-y 
      class="log-scroll"
      :scroll-top="scrollPosition"
      @scroll="onScroll"
    >
      <view
        v-for="(log, index) in filteredLogs"
        :key="index"
        :class="['log-item', log.type, { 'highlighted': index === currentResultIndex }]"
        :id="`log-item-${index}`"
      >
        <view class="log-header">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-type">{{ log.type.toUpperCase() }}</text>
        </view>
        <view class="log-message">
          <span 
            v-html="highlightKeyword(log.message, searchKeyword)"
          ></span>
        </view>
      </view>
    </scroll-view>

    <view class="btn-group">
      <button @click="clearLogs">清空日志</button>
      <button @click="toggleState">收起</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

// 日志存储
const logs = ref<{ message: string; type: string; time: string }[]>([])
const maxLogs = 200

// 搜索相关状态
const searchKeyword = ref('')
const filteredLogs = ref<{ message: string; type: string; time: string }[]>([])
const currentResultIndex = ref(-1)
const scrollPosition = ref(0)
const lastScrollTop = ref(0)

// 控制悬浮按钮 / 面板状态
// hidden = 半隐藏, visible = 全显, panel = 展开面板
const state = ref<"hidden" | "visible" | "panel">("hidden")

// 保存原始 console
const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error

// 添加HTML转义函数 - 核心修复
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addLog(message: string, type = "log") {
  const time = new Date().toLocaleTimeString()
  // 关键修复：在记录日志时就进行HTML转义
  const escapedMessage = escapeHtml(message)
  logs.value.push({ message: escapedMessage, type, time })
  if (logs.value.length > maxLogs) logs.value.shift()
  
  // 如果有搜索关键词，自动过滤
  if (searchKeyword.value) {
    filterLogs()
  } else {
    filteredLogs.value = [...logs.value]
  }
}

// 处理搜索
function handleSearch() {
  filterLogs()
}

// 过滤日志
function filterLogs() {
  if (!searchKeyword.value.trim()) {
    filteredLogs.value = [...logs.value]
    currentResultIndex.value = -1
    return
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  filteredLogs.value = logs.value.filter(log => 
    log.message.toLowerCase().includes(keyword) || 
    log.type.toLowerCase().includes(keyword)
  )
  
  // 重置当前结果索引
  currentResultIndex.value = filteredLogs.value.length > 0 ? 0 : -1
  scrollToCurrentResult()
}

// 清除搜索
function clearSearch() {
  searchKeyword.value = ''
  filteredLogs.value = [...logs.value]
  currentResultIndex.value = -1
}

// 高亮关键字
function highlightKeyword(text: string, keyword: string) {
  if (!keyword.trim()) return text
  
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 转义正则特殊字符
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 导航结果
function navigateResult(direction: number) {
  if (filteredLogs.value.length === 0) return
  
  let newIndex = currentResultIndex.value + direction
  
  // 循环导航
  if (newIndex < 0) {
    newIndex = filteredLogs.value.length - 1
  } else if (newIndex >= filteredLogs.value.length) {
    newIndex = 0
  }
  
  currentResultIndex.value = newIndex
  scrollToCurrentResult()
}

// 滚动到当前结果
function scrollToCurrentResult() {
  if (currentResultIndex.value === -1) return
  
  // 简单的滚动位置计算
  const itemHeight = 120 // 每条日志大致高度
  scrollPosition.value = currentResultIndex.value * itemHeight
}

// 监听滚动事件
function onScroll(e: any) {
  lastScrollTop.value = e.detail.scrollTop
}

onMounted(() => {
  // 初始化过滤的日志
  filteredLogs.value = [...logs.value]
  
  console.log = (...args) => {
    addLog(
      args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "),
      "log"
    )
    originalLog.apply(console, args)
  }
  console.warn = (...args) => {
    addLog(
      args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "),
      "warn"
    )
    originalWarn.apply(console, args)
  }
  console.error = (...args) => {
    addLog(
      args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "),
      "error"
    )
    originalError.apply(console, args)
  }
  
  // 监听日志变化，同步更新过滤结果
  watch(logs, () => {
    if (!searchKeyword.value) {
      filteredLogs.value = [...logs.value]
    }
  })
})

function clearLogs() {
  logs.value = []
  filteredLogs.value = []
  currentResultIndex.value = -1
}

function toggleState() {
  if (state.value === "hidden") {
    state.value = "visible"
  } else if (state.value === "visible") {
    state.value = "panel"
  } else {
    state.value = "hidden"
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.floating-btn {
  position: fixed;
  right: 0;
  bottom: 200rpx;
  z-index: 20078;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(3, 252, 127, 0.85);
  color: #fff;
  line-height: 100rpx;
  text-align: center;
  font-weight: bold;
  font-size: 26rpx;
  transition: right 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}
.floating-btn.half-hidden {
  right: -40rpx; /* 半隐藏到右边缘 */
}

.log-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 800rpx;
  background: #1e1e1e;
  z-index: 9999;
  padding: 16rpx;
  box-sizing: border-box;
  font-family: monospace;
  display: flex;
  flex-direction: column;
}

.search-container {
  margin-bottom: 16rpx;
}

.search-input-group {
  display: flex;
  align-items: center;
  background: #333;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 60rpx;
  margin-bottom: 8rpx;
}

.search-icon {
  color: #888;
  margin-right: 8rpx;
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24rpx;
  outline: none;
}

.search-input::placeholder {
  color: #888;
}

.clear-icon {
  color: #888;
  font-size: 28rpx;
  cursor: pointer;
  padding: 4rpx;
}

.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 22rpx;
  padding: 0 8rpx;
}

.search-nav {
  display: flex;
  gap: 8rpx;
}

.nav-btn {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  padding: 0;
  margin: 0;
  background: #444;
  color: #fff;
  border-radius: 4rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 12rpx;
}

.log-item {
  padding: 12rpx;
  margin-bottom: 12rpx;
  border-radius: 8rpx;
  line-height: 1.4;
  border-left: 4rpx solid transparent;
  transition: background-color 0.2s;
}

.log-item.highlighted {
  background-color: rgba(66, 133, 244, 0.2);
  border-left-color: #4285f4;
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4rpx;
  font-size: 20rpx;
}

.log-time {
  color: #888;
}

.log-type {
  font-weight: bold;
  font-size: 22rpx;
}

.log-message {
  font-size: 24rpx;
  white-space: pre-wrap;
  word-break: break-all;
}

.highlight {
  background-color: rgba(255, 215, 0, 0.4);
  color: #000;
  padding: 0 2rpx;
  border-radius: 2rpx;
  font-weight: bold;
}

.log-item.log {
  background: rgba(76, 175, 80, 0.08);
  border-left-color: #4caf50;
  color: #4caf50;
}

.log-item.warn {
  background: rgba(255, 152, 0, 0.08);
  border-left-color: #ff9800;
  color: #ff9800;
}

.log-item.error {
  background: rgba(244, 67, 54, 0.08);
  border-left-color: #f44336;
  color: #f44336;
}

.btn-group {
  display: flex;
  justify-content: space-around;
  padding: 8rpx 0;
}
.btn-group button {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  margin: 0 8rpx;
  background: #333;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
