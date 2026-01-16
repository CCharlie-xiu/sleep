<template>
  <view class="popup">
    <view
      class="overlay"
      :class="{ show: showPopup }"
      :style="[{ top: customStyle.top }]"
      @touchmove.stop.prevent="() => {}"
      @click="showPopup = false"
    ></view>
    <view
      class="content fixed px-40 py-40 w-100 page-bg-color"
      :style="[customStyle]"
      :class="[customClass, { show: showPopup }]"
      @touchmove.stop.prevent="() => {}"
    >
      <view class="label tn-flex justify-between items-center">
        <text class="font-size-32 font-color-v22"> 分类 </text>
        <tn-icon
          name="up"
          :color="$themeConfig.var_icon_v1_color"
          :custom-style="{
            width: '22rpx',
            height: '11rpx',
          }"
          @click="showPopup = false"
        >
        </tn-icon>
      </view>
      <z-paging
        ref="paging"
        v-model="dataList"
        @query="queryList"
        :show-loading-more-no-more-view="false"
        :default-page-size="listSize"
        :auto="false"
        :fixed="false"
        :refresher-enabled="false"
        :height="zPagingHeight"
      >
        <view
          class="list rela mt-8 tn-flex items-center tn-flex-wrap justify-between"
          @click="handleListClick"
        >
          <view
            class="item bg-color-v13 font-size-32 font-color-v38 mt-18 tn-text-center"
            v-for="(item, index) in dataList"
            :key="index"
            :class="{
              'active ': index == current,
            }"
            :data-index="index"
          >
            {{ item.categoryName }}
          </view>
          <view class="item" v-for="item in lastRowOver" :key="item"> </view>
        </view>
      </z-paging>
      <view class="mask abso w-100" v-if="dataList.length >= 12"> </view>
    </view>
  </view>
</template>

<script setup>
import ZPaging from "@/components/z-paging/components/z-paging/z-paging.vue";
import { computed, nextTick, watch } from "vue";
// API 调用已移除 - listCategory

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  current: {
    type: [Number, String],
    default: 0,
  },
  sourceList: {
    type: Array,
    default: () => [],
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  customClass: {
    type: [String, Object],
    default: "",
  },
  listSize: {
    type: Number,
    default: 12,
  },
});
const emit = defineEmits([
  "update:modelValue",
  "update:sourceList",
  "handleSearchClick",
]);
const { proxy } = getCurrentInstance();
const showPopup = ref(false);
const current = ref(0);
const paging = ref();
const dataList = ref([]);

// const maxHeight = proxy.$screenHeight / 2 - proxy.$navAStatusBarHeight;
const zPagingHeight = computed(() => {
  const sourceListHeight = Math.ceil(props.sourceList.length / 3) * 109;
  // const result = sourceListHeight > maxHeight ? maxHeight : initListHeight;
  // return result + "px";

  return props.sourceList.length > 12 ? "499rpx" : sourceListHeight + "rpx";
});

watch(
  () => props.modelValue,
  (val) => {
    showPopup.value = val;
    if (val && props.sourceList.length && !dataList.value.length) {
      paging.value.complete(props.sourceList);
    }
  },
  { immediate: true }
);
watch(
  () => showPopup.value,
  (val) => {
    emit("update:modelValue", val);
  }
);
watch(
  () => props.current,
  (val) => {
    current.value = val;
  },
  { immediate: true }
);
// watch(
//   () => props.sourceList,
//   (val) => {
//     nextTick(() => {
//       paging.value.complete(val);
//     });
//   },
//   {
//     immediate: true,
//   }
// );

const lastRowOver = computed(() => {
  const remainder = dataList.value.length % 3;
  const emptyCount = remainder === 0 ? 0 : 3 - remainder;
  return Array.from(
    { length: emptyCount },
    (_, i) => i
  );
});

const handleListClick = (e) => {
  console.debug("e #debug =======>", e);
  const { index } = e.target.dataset;
  if (typeof index === "number") {
    current.value = index;
    // emit("handleListClick", dataList.value[index]);
    emit("handleListClick", index);
    showPopup.value = false;
  }
};

const queryList = (pageNo, pageSize) => {
  listCategory(pageNo, pageSize, {
    templateAggFilterDto: null,
    parentCategoryCode: "aiColumn",
  })
    .then((res) => {
      // if(res.data.listCategoryAgg.records && res.data.listCategoryAgg.records.length){
      const list = res.data.listCategoryAgg.records.map((item) => {
        return {
          categoryName: item.categoryName,
          id: item.id,
          page: 0,
          scrollTop: 0,
        };
      });
      paging.value.complete(list);
      list.length && emit("update:sourceList", dataList.value);
      // }else{
      //   paging.value.complete(false);
      // }
    })
    .catch((err) => {
      console.debug("listCategory err #debug =======>", err);
      paging.value.complete(false);
    });
};
</script>
<style lang="scss" scoped>
.popup {
  // height: 562rpx;
  .content {
    overflow: hidden;
    border-radius: 0 0 70rpx 70rpx;
    z-index: 20074;
    transition-duration: 300ms;
    transition-property: all;
    transition-timing-function: ease;
    transform: scaleY(0);
    transform-origin: top center;
    // max-height: 499rpx;
    .list {
      .item {
        border-radius: 18rpx;
        height: 89rpx;
        width: 210rpx;
        line-height: 89rpx;
        transition: 0.1s;
        &.active {
          color: var(--var_font_v39_color) !important;
          background: var(--var_bg_v12_color) !important;
        }
      }
    }
    .mask {
      background: linear-gradient(#fff0, #0b0912);
      bottom: 0;
      left: 0;
      height: 145rpx;
      pointer-events: none;
    }
  }
  .overlay {
    background: rgba(0, 0, 0, 0.5);
    transition-duration: 300ms;
    opacity: 0;
    z-index: 20000;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transition-property: all;
    transition-timing-function: ease;
    visibility: hidden;
    // transform: scaleY(0);
    // transform-origin: top center;
  }
  .show {
    opacity: 1;
    visibility: visible;
    transform: scaleY(1);
  }
}
</style>
