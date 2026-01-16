<template>
  <custom-popup v-model="visible" open-direction="top" bg-color="transparent" :overlay-opacity="0.5"
    :overlay-closeable="true" :radius="50" :showHeader="false" top="65%" :popupStyle="{maxHeight: '600rpx'}">
    <view class="point px-38 rela">
      <view class="point-header tn-flex-center-between py-20 px-48 bg-color-v51">
        <view class="font-size-30 font-color-v67 font-weight-400">积分消耗明细</view>
        <view class="close" @click="visible = false">
          <tn-icon name="down" :color="$themeConfig.var_icon_v20_color" />
        </view>
      </view>
      <!-- #ifdef APP-PLUS -->
      <scroll-view scroll-y class="point-content px-48 bg-color-v52">
        <view v-for="(item, index) in pointList" :key="index">
          <view v-if="item.salesPointPrice !== 0" class="point-content-item py-24 tn-flex-center-between font-color-v68 font-size-28 font-weight-400">
            <view>{{ item.skuName }}</view>
            <view>{{ item.salesPointPrice }}积分</view>
          </view>
        </view>
      </scroll-view>
      <!-- #endif -->
      <!-- #ifndef APP-PLUS -->
      <scroll-view scroll-y class="point-content px-48 bg-color-v52">
        <template v-for="(item, index) in pointList" :key="index">
          <view v-if="item.salesPointPrice !== 0"
            class="point-content-item py-24 tn-flex-center-between font-color-v68 font-size-28 font-weight-400">
            <template>
              <view>{{ item.skuName }}</view>
              <view>{{ item.salesPointPrice }}积分</view>
            </template>
          </view>
        </template>
      </scroll-view>
      <!-- #endif -->
      <view class="point-footer bg-color-v52 px-48">
        <view class="point-footer-item pt-40 pb-48 tn-flex-center-between font-color-v68 font-size-28 font-weight-400">
          <view>总计</view>
          <view class="font-color-v74 font-weight-400 font-size-28">{{ actualPoint }}积分</view>
        </view>
      </view>
      <view class="point-icon abso">
        <tn-icon :size="128" :color="$themeConfig.var_icon_v19_color" name="down-triangle"></tn-icon>
      </view>
    </view>
  </custom-popup>
</template>

<script setup>
import { onMounted, ref } from "vue";
const { proxy } = getCurrentInstance();
/* const routerquery = proxy.$Router.getRouterParams().query;
const templateId = routerquery.tm; */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pointList: {
    type: Array,
    default: () => [],
  },
  actualPoint: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(["update:modelValue"]);

const itemList = ref([]);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
</script>

<style lang="scss" scoped>
.point {
  .point-header {
    border-radius: 50rpx 50rpx 0 0;
  }
  .point-content {
    max-height: 40vh;
  }
  .point-footer {
    border-radius: 0 0 50rpx 50rpx;
    .point-footer-item {
      border-top: 2rpx solid var(--var_border_v16_color);
    }
  }
  .point-icon {
    bottom: -80rpx;
    left: 80rpx;
  }
}
</style>