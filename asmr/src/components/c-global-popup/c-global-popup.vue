<template>
  <tn-popup
    v-model="visible"
    open-direction="center"
    :overlay-closeable="true"
    bg-color="transparent"
    @close="handleClose"
    @overlay-click="handleClose"
  >
    <view class="popup-container pt-66 rela">
      <!-- 背景图 -->
      <image class="popup-bg" :src="config?.bgImg" mode="widthFix"></image>

      <!-- 按钮区域 -->
      <view class="popup-btn abso px-40 tn-flex justify-around">
        <view
          v-for="(btn, index) in config?.btnConfig"
          :key="index"
          class="button-wrapper mx-20"
          @click="handleButtonClick(btn)"
        >
          <image
            class="button-image"
            :src="btn.btnImg"
            mode="heightFix"
          ></image>
        </view>
      </view>

      <!-- 倒计时 -->
      <view
        v-if="config?.showCountDown"
        class="popup-countdown w-100 tn-flex-center-center abso"
      >
        <TnCountDown
          :time="config?.countdown"
          :boxStyle="{
            width: '59rpx',
            height: '59rpx',
            background: 'var(--var_bg_v72_color)',
            borderRadius: '17rpx',
            fontWeight: '400',
            fontSize: '36rpx',
            color: 'var(--var_font_v1_color)',
            display: 'flex',
            'justify-content': 'center',
            'align-items': 'center',
          }"
        />
        <text class="font-color-v1 font-size-32 font-weight-400 ml-18">
          后即将过期
        </text>
      </view>

      <view v-if="config?.showCloseBtn" class="abso close-icon" @click="handleClose">
        <tn-icon name="close" size="36" color="#fff" />
      </view>
    </view>
  </tn-popup>
</template>

<script setup>
import { computed } from "vue";
import TnCountDown from "@/uni_modules/tuniaoui-vue3/components/count-down/src/count-down.vue";
// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  countdown: {
    type: Number,
    default: 0,
  },
});

// 定义 emits
const emit = defineEmits(["update:modelValue", "action"]);
const { proxy } = getCurrentInstance();

const visible = computed({
  get() {
    if (props.modelValue) {
      console.log("config>>", props.config);
    }

    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

// 处理按钮点击事件
const handleButtonClick = (btnConfig) => {
  emit("action", btnConfig);
};

const handleClose = () => {
  onClose();
  proxy.$Router.back();
};

// 关闭事件处理
const onClose = () => {
  emit("update:modelValue", false);
};
</script>

<style lang="scss" scoped>
.popup-container {
  width: 600rpx;
  .popup-bg {
    width: 100%;
    border-radius: 20rpx;
  }
  .popup-btn {
    bottom: 40rpx;
    left: 0;
    right: 0;
    .button-image {
      height: 100rpx;
    }
    .button-wrapper {
      // flex: 1;
    }
  }
  .popup-countdown {
    top: 0;
  }
  .close-icon {
    top: 40rpx;
    right: 0;
  }
}
</style>