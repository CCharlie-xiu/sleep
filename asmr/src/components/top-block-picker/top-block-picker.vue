<template>
  <tn-popup v-model="showPopup" open-direction="top" bg-color="transparent"
  :top="$navAStatusBarHeight + 'px'">
    <view
      class="popup p-58 bg-color-v14"
      :class="customClass"
      :style="[
        {
          paddingTop: $navAStatusBarHeight + 'px !important',
          maxHeight: `calc(${$navAStatusBarHeight}px + 562rpx)`,
        },
        customStyle,
      ]"
    >
      <slot name="top">
        <search-box
          :searchStyle="{
            padding: '0 !important',
          }"
          customClass="bg-color-v13 mt-20 w-100 py-8"
          :customStyle="{
            borderRadius: '32rpx',
          }"
          :placeholderStyle="`color: ${$themeConfig.var_font_v23_color}; font-size: 30rpx !important;`"
          :inputStyle="{
            color: $themeConfig.var_font_v23_color,
          }"
          :showSubmit="false"
          :inactiveIconColor="$themeConfig.var_font_v23_color"
          readonly
          @handleClick="handleSearchClick"
        >
          <template #suffix>
            <view class="tn-flex items-center">
              <view class="mr-18 font-color-v23">|</view>
              <view class="font-size-32 font-color-v23">搜索</view>
            </view>
          </template>
        </search-box>
      </slot>
      <slot>
        <view class="content mt-30">
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
          <z-paging ref="paging" v-model="dataList" @query="queryList"
          :show-loading-more-no-more-view="false"
          :auto="false"
          :fixed="false"
          :refresher-enabled="false"
          :height="zPagingHeight">
            <view
              class="list mt-8 tn-flex items-center tn-flex-wrap"
              @click="handleListClick"
            >
              <view
                class="item bg-color-v13 font-size-32 font-color-v38 mt-18 tn-text-center"
                v-for="(item, index) in dataList"
                :key="index"
                :class="{
                  'active ': index === current,
                  'ml-18': index % 3 !== 0,
                }"
                :data-index="index"
              >
                {{ item.categoryName }}
              </view>
            </view>
          </z-paging>
        </view>
      </slot>
      <slot name="bottom"></slot>
    </view>
  </tn-popup>
</template>

<script setup>
import ZPaging from "@/components/z-paging/components/z-paging/z-paging.vue";
import { computed, nextTick, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  current: {
    type: Number,
    default: 0,
  },
  initList: {
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
});
const emit = defineEmits(["update:modelValue", "handleSearchClick"]);
const { proxy } = getCurrentInstance();
const showPopup = ref(false);
const current = ref(0);
const paging = ref();
const dataList = ref([]);

const maxHeight = proxy.$screenHeight / 2 - proxy.$navAStatusBarHeight;
const zPagingHeight = computed(() => {
  const initListHeight = uni.upx2px(Math.ceil(props.initList.length / 3) * 105);
  const result = initListHeight > maxHeight ? maxHeight : initListHeight;
  return result + 'px';
})

watch(
  () => props.modelValue,
  (val) => {
    showPopup.value = val;
    if(val && props.initList.length){
      paging.value.complete(props.initList);
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
//   () => props.initList,
//   (val) => {
//     nextTick(() => {
//       paging.value.complete(val);
//     });
//   },
//   {
//     immediate: true,
//   }
// );

const handleSearchClick = () => {
  showPopup.value = false;
  emit("handleSearchClick");
};

const handleListClick = (e) => {
  const { index } = e.target.dataset;
  if (typeof index === "number") {
    current.value = index;
    emit("handleListClick", dataList.value[index]);
    showPopup.value = false;
  }
};

const queryList = (pageNo, pageSize) => {
  // 此处请求仅为演示，请替换为自己项目中的请求
  // request
  //   .queryList({ pageNo, pageSize })
  //   .then((res) => {
  //     // 将请求结果通过complete传给z-paging处理，同时也代表请求结束，这一行必须调用
  //     paging.value.complete(res.data.list);
  //   })
  //   .catch((res) => {
  //     // 如果请求失败写paging.value.complete(false);
  //     // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
  //     // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
  //     paging.value.complete(false);
  //   });
};
</script>
<style lang="scss" scoped>
.popup {
  border-radius: 0 0 70rpx 70rpx;
  // height: 562rpx;
  .content {
    .list {
      .item {
        border-radius: 18rpx;
        height: 89rpx;
        width: 201rpx;
        line-height: 89rpx;
        transition: 0.1s;
        &.active {
          color: var(--var_font_v39_color) !important;
          background: var(--var_bg_v12_color) !important;
        }
      }
    }
  }
}
</style>
