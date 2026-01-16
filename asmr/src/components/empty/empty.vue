<template>
  <view>
    <ZPagingEmptyView v-bind="currentEmptyViewConfig" @reload="handleReload" />
  </view>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import ZPagingEmptyView from "@/components/z-paging/components/z-paging-empty-view/z-paging-empty-view.vue";
import useReConnected from "@/hooks/useReConnected";
import { global } from "@/common/plugins/theme";
import { usePageEvent } from "@/hooks/usePageEvent";
import { emptyStatus } from "@/common/data/enum.js";

const { onPageEvent } = usePageEvent();

const { networkType } = useReConnected();

const emit = defineEmits(["reload"]);

// 接收外部传入的状态（如'error' | 'empty'）
// const props = defineProps({
//   status: {
//     type: String,
//     default: "empty",
//   },
// });

// const EMPTY_STATUS = {
//   noNetwork: "noNetwork",
//   error: "error",
//   empty: "empty",
// };

// 状态映射配置
const emptyViewConfigs = {
  [emptyStatus.noNetwork]: {
    emptyViewText: global.noNetworkText,
    emptyViewImg: global.noNetworkImg,
    emptyViewReloadText: global["empty-view-reload-text"],
    emptyViewImgStyle: global["empty-view-img-style"],
    emptyViewTitleStyle: global["empty-view-title-style"],
    emptyViewReloadStyle: global["empty-view-reload-style"],
    showEmptyViewReload: true,
    emptyViewFixed: false,
  },
  [emptyStatus.error]: {
    emptyViewText: global["empty-view-error-text"],
    emptyViewImg: global.emptyViewErrorImg,
    emptyViewReloadText: global["empty-view-reload-text"],
    emptyViewImgStyle: global["empty-view-img-style"],
    emptyViewTitleStyle: global["empty-view-title-style"],
    emptyViewReloadStyle: global["empty-view-reload-style"],
    showEmptyViewReload: true,
    emptyViewFixed: false,
  },
  [emptyStatus.empty]: {
    emptyViewText: global["empty-view-text"],
    emptyViewImg: global.emptyViewImg,
    emptyViewReloadText: global["empty-view-reload-text"],
    emptyViewImgStyle: global["empty-view-img-style"],
    emptyViewTitleStyle: global["empty-view-title-style"],
    emptyViewReloadStyle: global["empty-view-reload-style"],
    showEmptyViewReload: false,
    emptyViewFixed: false,
  },
};

const currentEmptyViewConfig = ref({});

// 监听父页面触发的事件
onPageEvent("emptyStatus", (data) => {
  if (networkType.value) {
    currentEmptyViewConfig.value = emptyViewConfigs[data.status];
  }
});

// 监听 status 和 networkType 变化
watch(
  () => networkType.value,
  (networkType) => {
    if (!networkType) {
      currentEmptyViewConfig.value = emptyViewConfigs[emptyStatus.NO_NETWORK];
    }
  },
  { immediate: true }
);

// 重载方法
const handleReload = () => {
  emit("reload");
};
</script>

<style lang="scss" scoped>
</style>