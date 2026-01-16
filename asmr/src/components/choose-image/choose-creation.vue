<template>
  <custom-popup
    v-model="visible"
    :overlay-closeable="true"
    open-direction="bottom"
    :bg-color="$themeConfig.var_bg_v27_color"
    :radius="50"
    :overlay-opacity="0.5"
    title="图片"
    showGrip
    :customHeight="maxHeight"
    @handleSubmit="handleSubmit"
    @changeHeight="handleChangeHeight"
  >
    <z-paging
      v-if="showPaging"
      ref="paging"
      v-model="dataList"
      @query="queryList"
      :show-loading-more-no-more-view="false"
      :auto="true"
      :fixed="false"
      :refresher-enabled="false"
      safe-area-inset-bottom
      :height="zPagingHeight + popupDeltaH + 'px'"
    >
      <view
        class="tn-flex tn-flex-wrap px-24 mt-22"
      >
        <WaterfallsFlow :value="dataList" :column="3" :containerWidth="702" columnSpace="24" :listStyle="{
          marginBottom: '24rpx'
        }" ref="waterfallsFlowRef">
          <!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
          <block v-for="(item, index) in dataList" :key="index">
            <template #[`slot${index}`]>
              <view class="item rela">
                <content-item 
                  :customClass="['bg-color-v32 tn-flex-center-center']"
                  :class="[
                   'hoverable-item tn-flex-center-center',
                   { 'active-border': current === item.id }]"
                  :src="item.coverEntity.accessUrl"
                  :width="item.coverEntity.width || '218rpx'" :height="item.coverEntity.height || '309rpx'"
                  borderRadius="18rpx" mode="widthFix" :showHover="false" @handleClick="handleChooseTemplate(item)">
                </content-item>
              </view>
            </template>
          </block>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN || MP-KUAISHOU -->
          <template #default="item">
            <view class="item" :class="{ active: current === item.id }">
              <content-item :customClass="['bg-color-v32 tn-flex-center-center']" :src="item.coverEntity.accessUrl"
                :width="item.coverEntity.width || '218rpx'" :height="item.coverEntity.height || '309rpx'"
                borderRadius="18rpx" mode="widthFix" :showHover="false" @handleClick="handleChooseTemplate(item)">
              </content-item>
            </view>
          </template>
          <!-- #endif -->
        </WaterfallsFlow>
        <!-- <content-item
            :customClass="['bg-color-v32 tn-flex-center-center ']"
            :src="item.coverEntity.accessUrl"
            :width="item.coverEntity.width"
            :height="item.coverEntity.height"
            borderRadius="18rpx"
            mode="widthFix"
            :showHover="false"
            @handleClick="handleChooseTemplate(item)"
          >
          </content-item> -->
      </view>
    </z-paging>
  </custom-popup>
</template>

<script setup>
import { ref } from "vue";
import ZPaging from "@/components/z-paging/components/z-paging/z-paging.vue";
// API 调用已移除 - listMyCreation
import { aiCreationStatus } from "@/common/data/enum.js";
// import waterContainer from "@/components/simple-waterfall/w-container.vue";
// import waterItem from "@/components/simple-waterfall/w-item.vue";
import WaterfallsFlow from "@/components/simple-waterfall/waterfalls-flow.vue";
import useTemplateListPage from "@/hooks/useTemplateListPage";
import { convertUnit } from "@/common/utils/util";

const { proxy } = getCurrentInstance();
const emit = defineEmits(["handleSubmit"]); // 定义事件

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const dataList = ref([]);

const columnSpacing = uni.upx2px(24);

const tempImagePath = ref(""); // 存储临时路径

const paging = ref(null);
const showPaging = ref(false);
const visible = computed({
  get() {
    if (props.modelValue) {
      showPaging.value = true;
    }
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const maxHeight = proxy.$windowHeight * 0.8;
const popupDeltaH = ref(0);
let popupCount = 0;
let initPopupHeight = 0;
const zPagingHeight = computed(() => {
  const height = maxHeight - proxy.$navAStatusBarHeight;
  return height;
});

const { handleComputedRealWH } = useTemplateListPage();

const queryList = (pageNo, pageSize) => {
  listMyCreation(pageNo, pageSize, {
    processStatusList: [aiCreationStatus.Success],
  })
    .then((res) => {
      const { records = [] } = res.data.listMyCreation;
      handleComputedRealWH({
        dataList: records,
        width: 202,
      });
      paging.value.complete(records);
    })
    .catch((err) => {
      paging.value.complete(false);
    });
};

const current = ref("");
const chooseItem = ref({});
const handleChooseTemplate = (item) => {
  console.log('dataList',dataList)
  console.log('handleChooseTemplate',item)
  current.value = item.id;
  chooseItem.value = item;
};

const handleChangeHeight = (height) => {
  if (popupCount) {
    popupDeltaH.value = height - initPopupHeight;
  } else {
    initPopupHeight = height;
  }
  popupCount++;
};

const itemDefatulHeight = uni.upx2px(309);
// 提供一个计算属性来获取最高列高度
const highestColumnHeight = computed(() => {
  if (dataList.value.length === 0) return 0;
  // 重置列高度
  const heights = [0, 0, 0];
  // 遍历所有项目，按顺序分配到各列
  dataList.value.forEach((item, index) => {
    const itemHeight =
      (convertUnit(item.coverEntity.height, 1) || itemDefatulHeight) +
      columnSpacing;
    // 计算当前项目应该分配到哪一列（0, 1, 2, 0, 1, 2,...）
    const columnIndex = index % 3;
    // 累加高度到对应列
    heights[columnIndex] += itemHeight;
  });
  const maxHeight = Math.max(...heights);
  console.debug(
    "maxHeight debug ====> ",
    heights,
    maxHeight,
    proxy.$safeAreaBottom || 0
  );
  return maxHeight + (proxy.$safeAreaBottom || 0);
});

const handleSubmit = () => {
  const {
    coverEntity: { accessUrl },
    cover,
  } = chooseItem.value;
  if (!accessUrl) {
    proxy.$Tips.toast("请先选中封面");
    return;
  }
  // 提取文件后缀名（不包含查询参数）
  const url = accessUrl.split("?")[0]; // 去除URL参数
  const extension = url.split(".").pop().toLowerCase(); // 获取后缀并转为小写
  const data = {
    id: cover,
    tempFilePath: accessUrl,
    fileType: extension,
  };
  emit("handleSubmit", data);
};
</script>
<style lang="scss" scoped>
.item {
  transition: 0.3s all;
  &.active {
    position: relative;
    &::before {
      z-index: 1;
      border-radius: 20rpx;
      content: "";
      position: absolute;
      // #ifdef APP-PLUS
      box-sizing: border-box;
      top: 0;
      left: 0;
      // #endif
      // #ifdef MP
      top: -4rpx;
      left: -4rpx;
      // #endif
      width: 100%;
      height: 100%;
      border: 4rpx solid var(--var_border_v10_color);

    }
  }
}

.hoverable-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4px solid transparent;
  border-radius: 18rpx;
  pointer-events: none;
  z-index: 2;
  transition: border-color 0.3s;
}
.active-border::after {
  border-color: var(--var_border_v10_color);
}

.hoverable-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4px solid transparent;
  border-radius: 18rpx;
  pointer-events: none;
  z-index: 2;
  transition: border-color 0.3s;
}
.active-border::after {
  border-color: var(--var_border_v10_color);
}
</style>
