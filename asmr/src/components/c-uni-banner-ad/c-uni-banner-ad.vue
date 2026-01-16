<template>
    <!-- #ifdef MP-WEIXIN -->
      <block v-for="(item, index) in filterAdConfig" :key="item.adParams.adpid">
        <view
          :class="customClass"
          :style="customStyle"
        >
          <uniad
            v-bind="item.adParams"
            @load="onadload"
            @error="onaderror"
            @close="onadclose"
          ></uniad>
        </view>
      </block>
    <!-- #endif -->
    <!-- #ifdef MP-KUAISHOU -->
    <block v-for="(item, index) in filterAdConfig" :key="item.adParams.unitId">
      <view
        :class="customClass"
        :style="customStyle"
      >
        <ad
          style="margin: 0;"
          :type="item.adParams.type"
          :unit-id="item.adParams.unitId"
          @load="onadload"
          @error="onaderror"
          @close="onadclose"
        ></ad>
      </view>
    </block>
  <!-- #endif -->
</template>
<script setup>
import { faltAdConfig, obj2KeyValue } from "@/common/ad/manage";
// API 调用已移除 - submitAd
import { ref } from "vue";
const props = defineProps({
  adConfig: {
    type: Array,
    default: () => [],
  },
  customClass: {
    type: String,
    default: "",
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["adClose"]); // 定义事件
const { proxy } = getCurrentInstance();

const filterAdConfig = computed(() => {
  const adList = faltAdConfig(props.adConfig);
  return adList.filter((item) => item.type === "banner");
});

const onadload = (e) => {
  console.log("广告数据加载成功");
};
const onadclose = (e, type) => {
  emit("adClose", e);
  console.log("onclose: " + e.detail);
};
const onaderror = (e) => {
  // 广告加载失败
  console.log("onerror: " + e.detail.errCode + " message:: " + e.detail.errMsg);
};
</script>