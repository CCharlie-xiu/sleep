<template>
  <view class="more-action" :style="[customStyle]">
    <tn-bubble-box
      position="bottom"
      :options="options"
      :offset="bubbleBoxOffset"
      :auto-close="false"
      @open="open"
      @close="close"
      @click="handleOptionClick"
    >
      <text class="more-dots">···</text>
    </tn-bubble-box>
  </view>
</template>
<script setup>
import { getCurrentInstance, onMounted, ref, watch, computed } from "vue";
import throttle from "@/common/utils/throttle";
// API 调用已移除 - createUserFavorite, createUserCollected, cancelUserFavorite, cancelUserCollected
const props = defineProps({
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  backgroundWidth: {
    type: Number,
    default: 0,
  },
  isLike: {
    type: Boolean,
    default: false,
  },
  isCollected: {
    type: Boolean,
    default: false,
  },
  templateId: {
    type: String,
    default: "",
  },
  showShare: {
    type: Boolean,
    default: true,
  },
});
const { proxy } = getCurrentInstance();
const emit = defineEmits(["Click", "close"]);
// 点赞收藏状态
const myCollected = ref(false);
const myFavorite = ref(false);
const favoriteNum = ref(0);
const collectedNum = ref(0);
const options = computed(() => {
  const baseOptions = [
    {
      text: "点赞",
      icon: "praise",
      openType: "",
      textColor: myFavorite.value
        ? proxy.$themeConfig["var_bg_v55_color"]
        : proxy.$themeConfig["var_font_v86_color"],
    },
    {
      text: "收藏",
      icon: "star",
      openType: "",
      textColor: myCollected.value
        ? proxy.$themeConfig["var_bg_v55_color"]
        : proxy.$themeConfig["var_font_v86_color"],
    },
    {
      text: "取消",
      icon: "close",
      openType: "close",
      textColor: proxy.$themeConfig["var_font_v85_color"],
    },
  ];
  // 根据 showShare 决定是否添加分享选项
  // #ifndef APP-PLUS
  if (props.showShare) {
    baseOptions.splice(2, 0, {
      text: "分享",
      icon: "share",
      openType: "share",
      textColor: proxy.$themeConfig["var_font_v86_color"],
    });
  }
  // #endif
 
  return baseOptions;
});
// 气泡框偏移量计算
const bubbleBoxOffset = computed(() => {
  const safeDistance = 70; // 安全距离阈值(px)
  const OrgWidth = proxy.$windowWidth;
  const aiWallpaperBoxWidth = props.backgroundWidth || 0;
  const distanceToRight = OrgWidth - aiWallpaperBoxWidth;
  // 如果距离太近，气泡框向左偏移
  if (distanceToRight < safeDistance) {
    return [-70, 0]; // 向左偏移60px
  }
  return [0, 0]; // 不偏移
});
const templateId = ref("");

const open = () => {
  emit("open");
};
const close = () => {
  emit("close");
};

watch(
  () => props.templateId,
  (val) => {
    templateId.value = val;
    myFavorite.value = props.isLike;
    myCollected.value = props.isCollected;
  },
  { deep: true, immediate: true }
);

const handleOptionClick = (index) => {
  const option = options.value[index];
  const params = {
    entityType: "template",
    entityId: parseInt(templateId.value),
  };
  // 根据不同的选项执行不同的操作
  switch (option.text) {
    case "点赞":
      // 处理点赞逻辑
      throttle(async () => {
        try {
          if (myFavorite.value) {
            // 取消点赞
            await cancelUserFavorite(params);
            favoriteNum.value--;
          } else {
            // 点赞
            await createUserFavorite(params);
            favoriteNum.value++;
          }
          myFavorite.value = !myFavorite.value;
        } catch (error) {
          console.error("点赞操作失败:", error);
        }
      }, 500);
      break;
    case "收藏":
      // 处理收藏逻辑
      throttle(async () => {
        try {
          if (myCollected.value) {
            // 取消收藏
            await cancelUserCollected(params);
            collectedNum.value--;
          } else {
            // 收藏
            await createUserCollected(params);
            collectedNum.value++;
          }
          myCollected.value = !myCollected.value;
        } catch (error) {
          console.error("收藏操作失败:", error);
        } finally {
        }
      }, 500);
      break;
    case "分享":
      // 处理分享逻辑
      break;
    case "取消":
      // 处理取消逻辑，关闭气泡框
      close();
      break;
  }
};

const handleClick = () => {};
const handleShopActions = () => {};
</script>

<style lang="scss" scoped>
.more-action {
  .more-dots {
    color: var(--var_font_v1_color);
    font-size: 24rpx;
    font-weight: bold;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
    line-height: 1;
  }
}
</style>
