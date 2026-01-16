<template>
  <div class="scroll-list-box">
    <view class="list"
    :style="[listBoxStyle]">
      <mescroll-uni
        ref="mescrollRef"
        @init="mescrollInit"
        @down="downCallback"
        @up="upCallback"
        @scroll="scrollback"
        :down="downOption"
        :up="upOption"
        :fixed="mescrollProps.fixed || false"
        :height="mescrollProps.height"
        :disableScroll="disableScroll"
      >
        <videoList
          ref="listRef"
          :dataList="dataList"
          :imageStyle="videoListProps.imageStyle"
          :modalStyle="videoListProps.modalStyle"
          :showTitle="videoListProps.showTitle"
          :showBottomMenu="videoListProps.showBottomMenu"
          :showPlayIcon="videoListProps.showPlayIcon"
          :bottomMenuOpt="videoListProps.bottomMenuOpt"
          :routerParams="videoListProps.routerParams"
          @navToDetail="handleClickVideo"
        >
        </videoList>
        <view class="body-empty u-flex u-row-center" v-if="!dataList.length && isLoadOnce">
          <image
            class="body-empty-img"
            :src="_img('mine/icon_empty.png')"
          ></image>
          <view class="body-empty-text family-lisu">空空如也~</view>
        </view>
        
      </mescroll-uni>
    </view>
    <view
      class="list-more theme-family u-flex u-row-center"
      @click="showMoreList('template')"
    >
      <view class="family-lisu u-font-30">{{
        isBottom ? videoListProps.moreTextEnd || "暂时没有更多视频哦" : videoListProps.moreText || "查看更多视频"
      }}</view>
      <image
        v-if="!isBottom"
        class="list-more-icon"
        :src="_img('index/list-more.png')"
      ></image>
    </view>
  </div>
</template>

<script>
import videoList from "@/components/videoList/index.vue";
import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";

export default {
  mixins: [MescrollMixin],
  components: {
    videoList,
  },
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
    videoListProps: {
      type: Object,
      default: {},
    },
    mescrollProps: {
      type: Object,
      default: () => {},
    },
    loadListApi: {
      type: Function,
      default: () => {},
    },
    endLimit: {
      type: Number,
      default: 6,
    },
    listBoxStyle: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      upOption: {
        use: true,
        page: {
          size: 10,
        },
        textLoading: "加载中...",
        textNoMore: "",
        toTop: {
          src: "",
        },
        empty: {
          use: false,
        },
        onScroll: true,
        showSkeleton: false,
      },
      downOption: {
        use: false,
        auto: false,
      },
      imgHeight: 0,
      disableScroll: true,
      isBottom: true,
      marginBottom: 0,
      isLoadOnce: false
    };
  },
  mounted(){
    if(this.videoListProps && this.videoListProps.marginBottom){
      this.marginBottom = uni.upx2px(this.videoListProps.marginBottom);
    }
  },
  methods: {
    /* 下拉刷新的回调 */
    downCallback() {
      this.mescroll.resetUpScroll();
      this.isLoadOnce = false;
    },
    upCallback(page) {
      let datas = {
        current: page.num,
        size: page.size,
      };
      this.loadListApi(datas)
        .then((res) => {
          this.isBottom = this.dataList.length <= this.endLimit;
          this.mescroll.endBySize(res.data.records.length, res.data.total);
          this.mescroll.endUpScroll(false);
        })
        .catch((err) => {
          this.mescroll.endErr();
        })
        .finally(() => {
          this.isLoadOnce = true;
        })
    },
    showMoreList(type) {
      if (this.isBottom) {
        return false;
      }
      this.disableScroll = false;
      this.$u.debounce(async () => {
        const data = this.mescroll.getScrollTop();
        if (!this.imgHeight) {
          this.imgHeight = await this.$refs.listRef.getImgHeight();
        }
        let scrollHeight = (this.imgHeight + this.marginBottom) * 2 + data;
        this.mescroll.scrollTo(scrollHeight, 300);
      }, 300);
    },
    scrollback() {
      this.$u.throttle(
        () => {
          const scrollTop = this.mescroll.getScrollTop();
          const height = this.imgHeight + this.marginBottom
          // 一屏的高度
          const viewHeight = height * 2;
          // 总高度
          const allHeight =
            height * Math.ceil(this.dataList.length / (this.videoListProps.rowLimit || 3));
          if (scrollTop + viewHeight > allHeight) {
            this.isBottom = true;
          } else {
            this.isBottom = false;
          }
        },
        10,
        false
      );
    },
    handleClickVideo(item) {
      const parmas = {
        ...item,
      };
      this.$emit("clickVideo", parmas);
    },
  },
};
</script>

<style lang="scss" scoped>
.scroll-list-box {
  .body-empty {
    margin-top: 108rpx;
    flex-direction: column;
    flex-wrap: wrap;
    &-img {
      width: 232rpx;
      height: 232rpx;
    }
    &-text {
      font-weight: 400;
      font-size: 28rpx;
      color: #666666;
    }
    &-btn {
      width: 196rpx;
      height: 60rpx;
      background: rgba(226, 187, 157, 0.44);
      border-radius: 56rpx 56rpx 56rpx 56rpx;
      border: 2rpx solid #bd6621;
      font-weight: bold;
      font-size: 24rpx;
      color: #a74c04;
      margin-top: 20rpx;
    }
  }
  .list-more {
    font-weight: 400;
    font-size: 24rpx;
    color: #2b2a31;
    text-align: center;
    line-height: 30rpx;
    margin-top: 16rpx;
    .list-more-icon {
      width: 21rpx;
      height: 16rpx;
      margin-left: 6rpx;
    }
  }
}
</style>