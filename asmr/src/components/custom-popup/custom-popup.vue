<template>
  <tn-popup
    v-model="visible"
    v-bind="$attrs"
    :showGrip="showGrip"
    @changeHeight="handleChangeHeight"
  >
    <view
      :class="[popupClass]"
      :style="{ ...popupStyle }"
      class="popup-container"
    >
      <view
        v-if="showHeader"
        :class="[showGrip ? '' : 'pt-24']"
        class="w-100 px-34 pb-24 tn-flex-center-between header rela"
      >
        <!-- 左侧 -->
        <view class="close" @click="visible = false">
          <tn-icon name="close" />
        </view>
        <view :class="[titleClass]" class="abso title">
          {{ title }}
        </view>
        <!-- 右侧 -->
        <slot name="header-right">
          <tn-button
            customClass="bg-color-v9 tn-flex-center-center font-size-36 font-weight-400 font-color-v1"
            :customStyle="{
              borderRadius: '33rpx',
              width: '153rpx',
              height: '66rpx',
            }"
            
            @click="handleSubmit"
          >
            确定
          </tn-button>
        </slot>
      </view>
      <!-- 内容区域插槽 -->
      <slot></slot>
    </view>
  </tn-popup>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "标题",
  },
  titleClass: {
    type: String,
    default: "w-100 font-size-36 font-color-v34 font-weight-5 title",
  },
  popupClass: {
    type: String,
    default: "",
  },
  popupStyle: {
    type: Object,
    default: () => {},
  },
  showGrip:{
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["update:modelValue", "handleSubmit", "changeHeight"]);

// 控制弹窗显示
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

// 提交事件
const handleSubmit = () => {
  emit("handleSubmit");
};

// 弹窗高度变化事件
const handleChangeHeight = (height) => {
  emit("changeHeight", height);
};
</script>

<style lang="scss" scoped>
.popup-container {
  .close {
    width: 28rpx;
    height: 28rpx;
    left: 50rpx;
  }
  .title {
    left: 50%;
    transform: translateX(-50%);
    max-width: 60%; /* 防止标题过长 */
    text-align: center;
  }
  .btn {
    width: 153rpx;
    height: 66rpx;
    border-radius: 33rpx;
  }
}
</style>