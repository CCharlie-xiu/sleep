<template>
  <view class="list u-flex u-flex-wrap u-row-between">
    <view
      class="list-item"
      :style="[itemStyle]"
      v-for="(item, index) in dataList"
      :key="index"
      @click.stop="navToDetail(item)"
      id="imageHeight"

    >
      <view
        class="list-item-image center-img"
        :style="[imageStyle]"
      >
        <image
          :style="[imageStyle]"
          class="image"
          :src="item.imageUrl"
          mode="widthFix"
        ></image>
        <!-- <video :src="item.playUrl" v-show="false" :controls="false"></video> -->
        <!-- <slot name="mask" :scope="item"></slot> -->
        <!-- 状态修改 -->
        <view
          :style="[maskStyle]"
          class="list-item-image-mask"
          v-if="item.aiwxStatus === 0 && item.aiwxStatusDesc"
        >
          <view class="u-progress-text padding-top-xs">
            <view class="u-text-center"> {{ item.aiwxStatusDesc }}</view>
            <view> 预计需要5分钟 </view>
          </view>
        </view>
        <view v-if="showPlayIcon" class="list-item-image-icon u-abso">
          <image :src="_img('common/icon_videoPlay.png')"></image>
        </view>
        <view
          class="list-item-modalTitle u-line-1"
          v-if="showTitle && item.title"
          :style="[modalStyle]"
          >{{ item.title }}</view
        >
        
      </view>
      <template v-if="showBottomMenu">
        <view
          class="list-item-bottom-menu u-flex-col"
        >
          <text v-if="bottomMenuOpt.showTitle"
          :style="[bottomMenuOpt.titleStyle]">
            {{item.title}}
          </text>
          <u-button
            :custom-style="bottomMenuOpt.buttonStyle"
            ripple
            :hair-line="false"
            shape="circle"
            @click="() => {
              navToDetail({clickSource: 'button', ...item, })
            }"
          >
            {{bottomMenuOpt.buttonText}}
          </u-button>
        </view>
      </template>
      <!-- <slot name="footer" :scope="item"></slot> -->
      <view class="list-item-mine u-flex u-row-between" v-if="showOperate">
        <view>
          <view class="list-item-mine-title">{{ item.title }}</view>
          <view class="list-item-mine-desc">{{ item.createTime }}</view>
        </view>
        <!--  -->
        <image
          v-if="item.aiwxStatus !== 0"
          @click.stop="operateVideo(item, index)"
          class="list-item-mine-image"
          :src="_img('mine/icon_mineMore.png')"
        ></image>
      </view>
    </view>
    <view
      style="height: 0"
      :style="{ width: imageStyle.width ? imageStyle.width : '216rpx' }"
      v-for="n in lastRowNum"
      :key="n"
    ></view>
  </view>
</template>
  
  <script>
export default {
  name: "videoList",
  props: {
    dataList: {
      type: Array,
      default() {
        return [];
      },
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    itemStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    imageStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    modalStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    lastRowNum: {
      type: Number,
      default: 2,
    },
    showPlayIcon: {
      type: Boolean,
      default: false,
    },
    showOperate: {
      type: Boolean,
      default: false,
    },
    maskStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    showBottomMenu: {
      type: Boolean,
      default: false,
    },
    bottomMenuOpt: {
      type: Object,
      default() {
        return {};
      },
    },
    routerParams: {
      type: Object,
      default() {
        return {};
      },
    }
  },
  computed: {},
  data() {
    return {
      type: "less",
    };
  },
  methods: {
    showDataList(type) {
      this.type = type;
    },
    navToDetail(item) {
      this.$emit("navToDetail", {
        ...item,
        ...this.routerParams
      });
    },
    operateVideo(item, index) {
      this.$emit("operateVideo", item, index);
    },
    getImgHeight() {
      return new Promise((resolve, reject) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select("#imageHeight")
          .boundingClientRect((data) => {
            resolve(data.height);
          })
          .exec();
      });
    },
  },
};
</script>
  
  <style lang="scss" scoped>
.list {
  .list-item {
    border-radius: 16rpx;
    position: relative;
    margin-bottom: 16rpx;
    .list-item-image {
      position: relative;
      overflow: hidden;
      z-index: 0;
      background-color: rgba(0, 0, 0, 0.3);
      .image {
        position: relative;
        // top: 0;
        // left: 0;
        z-index: -1; //查看更多滚动，层级问题。把图片当成背景图
        border-radius: 0 !important;
      }
      .list-item-image-mask {
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        left: 0rpx;
        top: 0rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        flex-direction: column;
        height: 470rpx;
        width: 328rpx;
        border-radius: 24rpx;
        z-index: 10;
        .u-progress-text {
          font-weight: 500;
          font-size: 24rpx;
          color: #ffffff;
        }
      }
      .list-item-modalTitle {
        width: 100%;
        font-weight: 400;
        font-size: 22rpx;
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        padding: 10rpx 16rpx;
        border-radius: 0 0 16rpx 16rpx;
        left: 0rpx;
        bottom: 0rpx;
        z-index: 9;
      }
      .list-item-image-icon {
        width: 88rpx;
        height: 88rpx;
        right: 16rpx;
        bottom: 16rpx;
        & > image {
          width: 88rpx;
          height: 88rpx;
        }
      }
    }
    .list-item-mine {
      padding: 8rpx 16rpx;
      &-title {
        font-size: 26rpx;
        color: #0e0e0e;
      }
      &-desc {
        font-weight: 400;
        font-size: 20rpx;
        color: #666666;
      }
      .list-item-mine-image {
        width: 40rpx;
        height: 40rpx;
      }
    }
  }
}
</style>
  