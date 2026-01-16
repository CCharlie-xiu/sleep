<template>
  <tn-notify
    ref="noticeRef"
    :offset-top="$navAStatusBarHeight"
    :customStyle="{
      borderRadius: '20rpx',
    }"
  >
    <view class="notice bg-color-v66 tn-flex-center-center p-8">
      <view class="font-weight-400 font-size-32 pl-22 font-color-v1">{{
        content
      }}</view>
      <tn-button
        customClass="bg-color-v65 px-34 py-18 ml-30 font-size-32 font-weight-400 font-color-v83"
        :customStyle="{
          borderRadius: '20rpx',
        }"
        @click="handleShowRecord"
      >
        查看
      </tn-button>
    </view>
  </tn-notify>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const noticeRef = ref(null);
const content = ref("");
const open = (msg) => {
  content.value = msg;
  noticeRef.value &&
    noticeRef.value.show({
      type: "",
      duration: 3000,
      bgColor: "transparent",
    });
};

const handleShowRecord = () => {
  // 如果目标地址和当前地址一样，则不跳转
  let path = "/minePages/create-record/create-record";
  const page = proxy.$Router.getRoute()
  const routePath = page.route;
  if (routePath && `/${routePath}` === path) {
    const vm = page.$vm;
    if (vm && vm.refresh) {
      vm.refresh();
    }
    return false;
  }
  proxy.$Router.push(path);
};

onMounted(() => {});

defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
.notice {
  border-radius: 20rpx;
}
</style>
