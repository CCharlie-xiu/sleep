<script lang="ts" setup>
import { notifyProps } from "./notify";
import TnOverlay from '../../overlay/src/overlay.vue'
import { useNotify, useNotifyCustomStyle } from "./composables";

const props = defineProps(notifyProps);

const { options, isActive, showNotify } = useNotify();
const { notifyClass, notifyStyle } = useNotifyCustomStyle(
  props,
  options,
  isActive
);

defineExpose({
  /**
   * @description: 显示通知
   */
  show: showNotify,
});
</script>

<template>
      <!-- 遮罩层 -->
    <TnOverlay
      :show="isActive && showModal"
      :z-index="overlayZIndex"
      :opacity="overlayOpacity"
      @click="onClickOverlay"
    />
  <view
     <!-- #ifdef MP-KUAISHOU -->
    v-if="isActive"
    <!-- #endif -->
    :class="[notifyClass]"
    :style="[notifyStyle, { 'pointer-events': !isActive ? 'none' : 'auto' }]"
    class="tn-flex items-center justify-between"
  >
    <slot>
      <view :style="textStyle">{{ options.msg }}</view>
      <slot name="left">
        <view v-if="options.iconName" class="notify-icon" :style="iconStyle">
          <!-- 默认成功图标 -->
          <tn-icon v-if="options.iconName === 'success'" name="success-circle-fill" size="48" color="#17CD7A"></tn-icon>
          <!-- 默认失败图标 -->
          <tn-icon v-if="options.iconName === 'filed'" name="close-fill" size="48" color="#CD3A17"></tn-icon>
        </view>
      </slot>
    </slot>
  </view>
</template>

<style lang="scss" scoped>
@import "../../../theme-chalk/src/notify.scss";
</style>
