<template>
  <view>
    <view
      class="loginCode-input-code font-color-v27 font-weight-400 font-size-28 tn-flex-center-center"
      :disabled="disabled"
      @click="onSend"
      >{{ text }}</view
    >
  </view>
</template>
        
<script setup>
import { ref } from "vue";
import { validatePhone } from "@/common/utils/util";
// props
const props = defineProps({
  // 按钮文本
  text: {
    type: String,
    default: "获取验证码",
  },
  // 计时数
  count: {
    type: Number,
    default: 60,
  },
  // 手机号
  phone: {
    type: String,
    default: "",
  },
  // 接口名称
  apiName: {
    type: String,
    default: "getSmsCode",
  },
});

// emit
const emits = defineEmits(["send"]);

const { proxy } = getCurrentInstance(); 

// data
const text = ref("");
const disabled = ref(false);
text.value = props.text;
let count = props.count;

// send code
const onSend = async () => {
  if (!validatePhone(props.phone)) return proxy.$Tips.toast("请输入正确的手机号码");
  if (disabled.value) return proxy.$Tips.toast(`${props.count}秒内只能发送一次`);
  // API 调用已移除 - sendSmsForSetUserInfo
  // TODO: 需要实现发送验证码逻辑
  proxy.$Tips.toast("发送验证码功能暂不可用");
};
</script>
        
<style lang="scss" scoped>
.loginCode-input-code {
  white-space: nowrap;
}
</style>
        