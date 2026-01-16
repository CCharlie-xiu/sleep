<script lang="ts" setup>
import TnOverlay from '../../overlay/src/overlay.vue'
import TnIcon from '../../icon/src/icon.vue'
import { popupEmits, popupProps } from './popup'
import { usePopup, usePopupCustomStyle } from './composables'
import { watch } from 'vue'

const props = defineProps(popupProps)
defineEmits(popupEmits)

const {
  showOverlay,
  showPopup,
  visiblePopup,
  overlayZIndex,
  zIndex,
  onClickCloseBtn,
  onClickOverlay,
} = usePopup(props)
const { ns, popupContentClass, popupContentStyle } = usePopupCustomStyle(props)

const { proxy, emit } = getCurrentInstance()

// 添加拖拽相关变量
const touchStartY = ref(0)
const startHeight = ref(0)
const isDragging = ref(false);
// 最小高度
const currentHeight = ref(uni.upx2px(props.height || 627)) // 默认高度
const minHeight = currentHeight.value;
// 限制最小和最大高度
const maxHeight = proxy.$windowHeight * 0.8 // 最大高度为屏幕高度的80%
// 添加拖拽事件处理函数
const handleTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY
  startHeight.value = currentHeight.value
  isDragging.value = true
}
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  const touchY = e.touches[0].clientY
  const deltaY = touchStartY.value - touchY // 计算垂直移动距离
  const newHeight = startHeight.value + deltaY
  if (newHeight >= minHeight && newHeight <= maxHeight) {
    currentHeight.value = newHeight
  }
}

// 添加触摸结束事件
const handleTouchEnd = () => {
  isDragging.value = false;
  emit('changeHeight', currentHeight.value)
}

// 添加重置高度的函数（可选）
const resetHeight = () => {
  currentHeight.value = props.height || 400
  emit('changeHeight', currentHeight.value)
}

const handleToTop = () => {
  currentHeight.value = maxHeight;
  emit('changeHeight', currentHeight.value)
}

watch(
  () => props.customHeight,
  (val) => {
    if(val){
      currentHeight.value = val > maxHeight ? maxHeight : val;
      emit("changeHeight", currentHeight.value);
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  emit('changeHeight', currentHeight.value)
})
</script>

<template>
  <view
    :class="[ns.b(), ns.is('show', showPopup), ns.is('visible', visiblePopup)]"
    :style="{
      zIndex,
    }"
  >
    <!-- 遮罩层 -->
    <TnOverlay
      :show="showOverlay"
      :z-index="overlayZIndex"
      :opacity="overlayOpacity"
      @click="onClickOverlay"
    />

    <!-- 弹框内容 -->
    <view  
    <!-- #ifndef MP-KUAISHOU -->
    @touchmove.stop.prevent="()=>{}" 
    <!-- #endif -->
    :class="[popupContentClass]" :style="[popupContentStyle, {height: (openDirection === 'bottom' && showGrip) ? currentHeight + 'px' : ''}]">
      <!-- 拖把 -->
      <view v-if="openDirection === 'bottom' && showGrip"  class="grip"
       @click="handleToTop"
        @touchstart="handleTouchStart"
        @touchmove.stop.prevent="handleTouchMove"
        @touchend="handleTouchEnd">
        <view class="bg-color-v44"></view>
      </view>
      <slot />

      <!-- 关闭按钮 -->
      <view
        v-if="closeBtn"
        :class="[ns.e('close-btn'), ns.em('close-btn', closeBtnPosition)]"
        @tap.stop="onClickCloseBtn"
      >
        <slot name="closeBtn">
          <TnIcon name="close" />
        </slot>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '../../../theme-chalk/src/popup.scss';
.grip{
  // position: absolute;
  width: 100%;
  // top: 0;
  padding: 26rpx 0;
  z-index: 1;
  touch-action: none; /* 防止浏览器默认触摸行为 */
  & > view{
    width: 74rpx;
    height: 12rpx;
    border-radius: 12rpx;
    margin: 0 auto;
  }
}
</style>
