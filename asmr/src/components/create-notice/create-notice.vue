<template>
  <view
    class="bottomCreate bg-color-v68 tn-flex-center-center p-8"
    v-if="drawing && !NO_SHOW_CREATE_ROUTE_PATH.includes(routePath)"
  >
    <view class="font-weight-400 font-size-30 pl-48 font-color-v87">
      当前有创作任务进行中...
    </view>
    <tn-button
      customClass="bg-color-v11 px-34 py-18 font-size-32 font-weight-400 font-color-v1"
      :customStyle="{
        borderRadius: '32rpx',
        marginLeft: '82rpx',
      }"
      @click="handleShowRecord"
    >
      点击查看
    </tn-button>
  </view>
</template>


<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useDrawingStore } from "@/store/drawing";
import { NO_SHOW_CREATE_ROUTE_PATH } from "@/common/data/constants.js";

const { proxy } = getCurrentInstance();
const drawingStore = useDrawingStore();
const { drawing } = storeToRefs(drawingStore);
const routePath = ref("");

const handleShowRecord = () => {
  // 如果目标地址和当前地址一样，则不跳转
  let path = "/minePages/create-record/create-record";
  const page = proxy.$Router.getRoute();
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

onMounted(() => {
  const page = proxy.$Router.getRoute();
  routePath.value = page.route;
});
</script>

<style lang="scss" scoped>
.notice {
  border-radius: 20rpx;
}

.bottomCreate {
  width: max-content;
  border-radius: 38rpx;
  position: fixed;
  bottom: 200rpx;
  z-index: 1000;
  left: 50%;
  transform: translateX(-50%);
}
</style>
