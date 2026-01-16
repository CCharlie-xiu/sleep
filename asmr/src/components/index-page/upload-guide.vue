<template>
  <view class="video">
    <view class="title u-flex">
      <view
        class="main-title margin-right-xs"
        :style="[
          {
            backgroundImage: `url(${_indexImg('auto-up-bg.png')})`,
          },
        ]"
      >
        <text class="theme-family u-font-34"> AI自动更新舞蹈视频 </text>
      </view>
      <text class="sub-title family-hw-regular">
        {{
          isLogin && recordList.length > 0
            ? "系统制作中(每周更新3个)"
            : "(每周自动更新3个)"
        }}
      </text>
    </view>
    <!-- 上传引导区 -->
    <view
      v-if="!isLogin || recordList.length === 0"
      class="u-flex upload-guide u-rela"
      :style="[
        {
          backgroundImage: `url(${_indexImg('upload-bg.png')})`,
        },
      ]"
      @click="navToUpload"
    >
      <image
        class="upload-icon u-abso"
        :src="_indexImg('upload-icon.png')"
      ></image>
    </view>
    <!-- 视频 -->
    <view v-if="isLogin" v-show="recordList.length > 0">
      <mescroll-uni
        ref="mescrollRef"
        @init="mescrollInit"
        @down="downCallback"
        @up="upCallback"
        @scroll="scrollback"
        :down="downOption"
        :up="upOption"
        :disableScroll="disableScroll"
        :height="recordList.length ? 534 : 0"
      >
        <videoList
          ref="myVideoList"
          :dataList="recordList"
          :imageStyle="{
            width: '334rpx',
            height: '530rpx',
            'border-radius': '32rpx',
          }"
          :modalStyle="{
            width: '334rpx',
            background: 'rgba(0, 0, 0, 0.5)',
            'border-radius': '0 0 32rpx 32rpx',
          }"
          :maskStyle="{
            width: '334rpx',
            height: '530rpx',
            borderRadius: '32rpx',
          }"
          :titleType="'modal'"
          @navToDetail="navToDetail"
        >
        </videoList>
      </mescroll-uni>
      <view  class="list-more theme-family u-flex u-row-center"  @click="showMoreList()">
          <view class="u-m-r-12 family-lisu u-font-30">{{
            isBottom ? "暂时没有更多视频哦" : "查看更多视频"
          }}</view>
          <image
            v-if="!isBottom"
            class="list-more-icon"
            :src="_img('common/icon_showMore.png')"
          ></image>
      </view>
    </view>
  </view>
</template>
<script>
import { mapState } from "vuex";
import videoList from "@/components/videoList/index.vue";
import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
import OpenMixins from "@/common/mixins/openVideo-mixins.js";
let isChangeBottom = true;
export default {
  mixins: [MescrollMixin, OpenMixins],
  components: { videoList },
  props: {
    recordLen: {
      type: Number,
      default: 0,
    },
    show: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      recordList: [],
      downOption: {
        use: true,
        isLock: true,
        bottomOffset: uni.upx2px(800)
      },
      upOption: {
        auto: true,
        page: {
          size: 10, // 每页10条
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
      aiwxStatusEnum: {
        0: "生成中...",
        1: "生成成功...",//
        2: "生成成功...",
      },
      imgHeight: 0,
      disableScroll: true,
      isBottom: true,
    };
  },
  computed: {
    ...mapState(["userinfo", "videoStatus"]),
    recordListLen() {
      return this.recordList.length;
    },
    isVip() {
      return this.isLogin && this.userinfo.orderStatus == 1;
    },
  },
  watch: {
    isLogin: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.mescroll && this.mescroll.resetUpScroll();
          });
        } else {
          this.recordList = [];
        }
      },
    },
    recordListLen(val) {
      this.$emit("update:recordLen", val);
    },
    videoStatus: {
      immediate: true,
      handler(val) {
        if (val && this.isLogin && this.show) {
          this.mescroll.resetUpScroll();
          isChangeBottom = false;
        }
      },
    },
    isVip(){
      this.isLogin && this.mescroll.resetUpScroll();
    }
  },
  mounted() {},
  methods: {
    _indexImg(url) {
      return this._img("index/" + url);
    },
    upCallback(page) {
      if (!this.isLogin) {
        this.mescroll.endErr();
        return;
      }
      let datas = {
        phone: this.userinfo.phoneNum,
        current: page.num,
        size: page.size,
      };
      this.$api
        .getVideoRecordPage(datas)
        .then((res) => {
          const curPageData = res.data.records || []; // 当前页数据
          const list = curPageData.map((item) => ({
            title: item.templateName,
            playUrl: item.videoUrl,
            id: item.id,
            imageUrl: item.picUrl,
            aiwxStatus: item.aiwxStatus,
            aiwxStatusDesc: this.aiwxStatusEnum[item.aiwxStatus],
          }));
        
          if (page.num === 1) this.recordList = [];
          this.recordList = this.recordList.concat(list); //追加新数据
          if (isChangeBottom && this.recordList.length > 2) this.isBottom = false;
          this.mescroll.endBySize(res.data.records.length, res.data.total);
          this.mescroll.endUpScroll(false);
          isChangeBottom = true;
        })
        .catch((err) => {
          this.mescroll.endErr();
        });
    },
    showMoreList() {
      if (this.isBottom) {
        return false;
      }
      this.mescroll.lockDownScroll(false);
      this.disableScroll = false;
      this.$u.debounce(async () => {
        const data = this.mescroll.getScrollTop();
        if (!this.imgHeight) {
          this.imgHeight = await this.$refs.myVideoList.getImgHeight();
        }
        let scrollHeight = this.imgHeight + data + 8;
        this.mescroll.scrollTo(scrollHeight, 300);
      }, 300);
    },
    scrollback() {
      this.$u.throttle(
        async () => {
          const scrollTop = this.mescroll.getScrollTop();
          // 一屏的高度
          const viewHeight = this.imgHeight + 8;
          // 总高度
          const height =
            (this.imgHeight + 8) * Math.ceil(this.recordList.length / 2);
          if (scrollTop + viewHeight >= height) {
            this.isBottom = true;
          } else {
            this.isBottom = false;
          }
        },
        10,
        false
      );
    },
    /* 下拉刷新的回调 */
    downCallback() {
      this.mescroll.resetUpScroll();
    },
    navToDetail(item) {
      if (item.aiwxStatus !== 0) {//
        const parmas = {
          ...item,
          videoType: "record",
        };
        this._openVideoPage(parmas);
      }
    },
    navToUpload() {
      this.$emit("chooseImage");
      // this.$Router.push({ path: "/pages/upload/upload" });
    },
  },
};
</script>
<style lang="scss" scoped>
.video {
  margin: 30rpx 30rpx 12rpx 30rpx;
  .title {
    margin-bottom: 8rpx;
    align-items: flex-end;
    margin-left: 10rpx;
    .main-title {
      @include background-mixin;
      text-align: center;
      padding: 12rpx 36rpx 16rpx 32rpx;
      line-height: 32rpx;
    }
    .sub-title {
      font-size: 18rpx;
      margin-bottom: 12rpx;
    }
  }
  .upload-guide {
    @include background-mixin;
    width: 719rpx;
    height: 371rpx;
    // margin-left: 30rpx;
    margin-top: -70rpx;
    margin-bottom: 30rpx;
    .title {
      align-items: baseline;
      top: 0;
      left: 8rpx;
      .main-title {
        padding: 8rpx 32rpx;
        padding: 14rpx 40rpx 14rpx 36rpx;
        line-height: 32rpx;
      }
      .sub-title {
        font-size: 18rpx;
      }
    }
    .upload-icon {
      width: 96rpx;
      height: 74rpx;
      left: 294rpx;
      top: 130rpx;
    }
  }
  .video-list {
    margin-bottom: 40rpx;
    max-height: 1092rpx;
    overflow: scroll;
  }
}
.list-more {
  font-weight: 400;
  font-size: 30rpx;
  color: #2b2a31;
  text-align: center;
  line-height: 30rpx;
  .list-more-icon {
    width: 21rpx;
    height: 16rpx;
    margin-left: 6rpx;
  }
}
</style>