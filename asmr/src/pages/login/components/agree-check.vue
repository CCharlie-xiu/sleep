<template>
  <custom-popup
    v-model="visible"
    open-direction="center"
    :overlay-opacity="0.5"
    :overlay-closeable="true"
    :showHeader="false"
    radius="40"
  >
    <view class="agree rela py-56 px-86">
      <view class="font-size-32 font-weight-400 font-color-v19 mb-36"
        >用户协议及隐私保护
      </view>
      <view class="font-size-28 font-weight-400 font-color-v20 mb-46"
        >为保障你的合法权益，请阅读并同意<text
                @click.stop="handleToAnswerPage('userAgreement')"
              >
                《用户协议》 </text
              >和<text
                @click.stop="handleToAnswerPage('privacyAgreement')"
              >
                《隐私政策》
              </text>
      </view>
      <tn-button
        customClass="bg-color-v11 font-size-32 font-color-v18 mt-40"
        :customStyle="{
          width: '425rpx',
          height: '100rpx',
          borderRadius: '50rpx',
        }"
        :open-type="openType"
        @click="handleLogin"
        @getphonenumber="handleGetPhoneNumber"
      >
        同意并登录
      </tn-button>

      <tn-button
        customClass="bg-color-v18 font-size-32 font-color-v19 mt-30"
        :customStyle="{
          width: '425rpx',
          height: '100rpx',
          borderRadius: '50rpx',
        }"
        @click="visible = false"
      >
        不同意
      </tn-button>
    </view>
  </custom-popup>
</template>

<script setup>
import { ref } from "vue";
import usePositionJump from "@/hooks/usePostionJump";
const { handleToAnswerPage } = usePositionJump();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  openType: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "handleLogin",
  "handleGetPhoneNumber",
]);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const handleLogin = () => {
  emit("handleLogin");
};

const handleGetPhoneNumber = (e) => {
  emit("handleGetPhoneNumber", e);
};
</script>

<style lang="scss" scoped>
.agree {
  border-radius: 25rpx;
  width: 650rpx;
  text-align: center;
}
</style>