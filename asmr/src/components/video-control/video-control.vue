<template>
  <view
    class="control-content tn-flex-center-center py-16 pr-24 pl-16 abso">
    <view
      class="cover-bg"
      :style="{ backgroundImage: 'url(' + coverAddress + ')' }"
    />
    <view class="body">
      <view class="title font-weight-500 font-size-33 font-color-v1 mr-30">{{
        templateName
      }}</view>
      <view class="point-detail tn-flex items-center" >
        <view
          class="point-detail-item tn-flex items-center font-size-24 font-weight-400 font-color-v1"
        >
          <!-- <image
            :src="`${$staticPath.free}/point-icon.png`"
            mode="scaleToFill"
          /> -->
          <text class="mt-6 mr-16 actualPoint font-weight-400 font-size-27">
            {{ actualPoint }} &nbsp;积分
          </text>
        </view>
        <tn-icon
          name="down"
          v-if="showDownIcon"
          :custom-style="{
            width: '21rpx',
            height: '9rpx',
          }"
          :color="$themeConfig.var_icon_v10_color"
        />
      </view>
    </view>
    <tn-button
      hover-class="hover-class"
      customClass="bg-color-v71 font-size-32 tn-flex-center font-color-v6 px-40 py-24"
      :customStyle="{
        width: '168rpx',
        height: '77rpx',
        borderRadius: '18rpx',
      }"
      debounce
      @click="handleShowUpload"
    >
      做同款
    </tn-button>
  </view>
</template>

<script setup>

import { ref } from "vue";

const props = defineProps({
  templateName:{
    type: String,
    required: true,
  },
  coverAddress: {
    type: String,
    required: true,
  },
  actualPoint:{
    type: Number,
    required: true,
  },
  showDownIcon:{
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["handleShowUpload", "handleShowPoint"]);

const handleShowUpload = () => {
  emit("handleShowUpload", true);
};

const handleShowPoint = () => {
  emit("handleShowPoint", true);
};
</script>

<style lang="scss" scoped>
.control-content {
  bottom: 87rpx;
  left: 24rpx;
  border-radius: 30rpx;
  pointer-events: auto;
  z-index: 1000;
  background-color: #27233fda;
  .cover-bg {
    border-radius: 18rpx;
    width: 110rpx;
    height: 110rpx; 
    background-size: cover;
    background-position: top; 
    margin-right: 22rpx;
  }
  .body {
    .point-detail {
      pointer-events: auto;
      .point-detail-item {
        .actualPoint {
          color: #8D87B1;
        }
        image {
          width: 30rpx;
          height: 30rpx;
        }
      }
    }
  }
}
</style>