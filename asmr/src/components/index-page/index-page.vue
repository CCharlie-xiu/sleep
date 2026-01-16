<template>
  <view
    v-show="show"
    class="page u-rela"
    :style="[
      {
        backgroundImage: `url(${_indexImg('bg.jpg')})`,
        paddingTop: paddingTop,
      },
    ]"
  >
    <!-- 上传引导热区 -->
    <!-- <uploadGuide :recordLen.sync="recordLen" @chooseImage="chooseImage" :show="show" /> -->
    <!-- 模板热区 -->
    <view
      class="template u-rela"
    >
      <view
      class="title">
        <view
          class="main-title margin-right-xs"
          :style="[
            {
              backgroundImage: `url(${_indexImg('auto-up-bg.png')})`,
            },
          ]"
        >
          <text class="theme-family u-font-34"> 用AI舞蹈模板跳同款 </text>
        </view>
      </view>
      <view class="tabs"
      @click="handleChangeTabs">
        <scroll-view class="tabs-box  family-lisu" scroll-x>
          <view class="item"
          :class="{active: index === tabIndex}"
          v-for="(item, index) in tabs"
          :key="index"
          :data-index="index"
          >
            {{item.typeName}}
            <image class="line u-abso" v-if="index === tabIndex"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAALCAMAAABbAB2FAAAAOVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC8dlA9AAAAEnRSTlMA8MAQMCCQYODfsKBQQF+AcG/gHHAlAAAAaUlEQVQY04WPSQ7AIAhFAWertuX+h63EGKdF30bCix8AAJvgRFGW52J2h9OBUYur2M090gwKHAtk5m/Uegogo1T4dmVq1kjTnoVQTK0LNYWpbxZ5J05jEi7K5/UsOzS582pH1ft4t8B/Pp/TB2jobfAyAAAAAElFTkSuQmCC">
            </image>
          </view>
        </scroll-view>
      </view>
      <scroll-list 
        ref="scrollListRef"
        :mescrollProps="{
          fixed: false,
          height: 1276
        }"
        :dataList="templateList"
        :loadListApi="upTempListCallback"
        :listBoxStyle="{
          margin: '0 16rpx'
        }"
        :endLimit="4"
        :videoListProps="{
          imageStyle: {
              width: '315.72rpx',
              height: '514rpx',
              'border-radius': '16rpx',
            },
            modalStyle: {
              width: '216rpx',
              background: 'rgba(0, 0, 0, 0.5)',
              'border-radius': '0 0 16rpx 16rpx',
            },
            showTitle: false,
            showBottomMenu: true,
            showPlayIcon: true,
            bottomMenuOpt: {
              showTitle: true,
              titleStyle: {
                fontSize: '30rpx',
                fontFamily: 'AlibabaPuHuiTi-3-65-Medium',
                margin: '8rpx 0 6rpx'
              },
              buttonStyle: {
                height: '54rpx',
                width: '314rpx',
                background: this.themeColor,
                color: '#fff',
                marginLeft: '26rpx',
                border: 'none',
                fontFamily: 'AlibabaPuHuiTi-3-65-Medium',
                fontWeight: 'normal',
                margin: 0,
                marginBottom: '14rpx'
              },
              buttonText: '跳同款',
            },
            moreText: '查看更多模板',
            moreTextEnd: '暂时没有更多模板哦',
            routerParams: {
              videoType: 'template'
            },
            marginBottom: 16,
            rowLimit: 2
        }"
        @clickVideo="navToDetail"
      ></scroll-list>
      
    </view>
    <!-- 默认铃音展示热区 -->
    <view
      class="u-mt-40 banner u-rela"
      :style="[
        {
          backgroundImage: `url(${_indexImg('banner-bg.png')})`,
        },
      ]"
    >
      <image
        :src="_indexImg('banner-icon.png')"
        class="banner-icon u-abso"
      ></image>
      <image :src="_indexImg('yun-left.png')" class="yun-left"></image>
      <image
        :src="_indexImg('yun-right.png')"
        class="yun-right"
        :style="[
          {
            top: `${isLogin && recordLen ? '-271' : '-214'}rpx`,
          },
        ]"
      ></image>
      <view class="huaquan-tag u-flex">
        <image
          :src="_indexImg('huaquan.png')"
          class="huaquan-bg u-abso"
        ></image>
        <view class="theme-family u-flex u-col-bottom">
          <text class="u-font-52 main">“舞”</text>
          <text class="u-font-44">知多少</text>
        </view>
      </view>
      <view class="theme-family color-9B5200 u-font-42 title">
        传播中国人舞蹈文化
      </view>
      <view class="desc u-font-26 family-lisu font-weight-b">
        系统会自动设为AI舞秀,打电话时能看到哦(不断更新中)
      </view>
      <view class="defaultList">
        <mescroll-uni
          ref="mescrollRef"
          @init="mescrollInit"
          @down="downCallback"
          @up="upCallback"
          @scroll="scrollback"
          :down="downOption"
          :up="upOption"
          :fixed="false"
          :height="700"
          :disableScroll="disableScroll"
        >
          <videoList
            ref="myVideoList"
            :dataList="defaultList"
            :imageStyle="{
              width: '216rpx',
              height: '342rpx',
              'border-radius': '16rpx',
            }"
            :modalStyle="{
              width: '216rpx',
              background: 'rgba(0, 0, 0, 0.5)',
              'border-radius': '0 0 16rpx 16rpx',
            }"
            :titleType="'modal'"
            @navToDetail="navToDetail"
          >
          </videoList>
          <view
            class="body-empty u-flex u-row-center"
            v-if="!defaultList.length"
          >
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
        @click="showMoreList()"
      >
        <view class="family-lisu u-font-30">{{
          isBottom ? "暂时没有更多视频哦" : "查看更多视频"
        }}</view>
        <image
          v-if="!isBottom"
          class="list-more-icon"
          :src="_img('index/list-more.png')"
        ></image>
      </view>
      <!-- <view v-else style="height: 40rpx"></view> -->
      <view class="product">
        <view class="product-tag u-flex">
          <image :src="_indexImg('product-icon.png')" class="icon"></image>
          <text class="theme-family u-font-40"> 产品介绍 </text>
        </view>
        <image
          :src="_indexImg('product-info.png')"
          class="product-info"
        ></image>
      </view>
    </view>
  </view>
</template>
<script>
import videoList from "@/components/videoList/index.vue";
import scrollList from "./scroll-list.vue";
import uploadGuide from "./upload-guide.vue";
import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
import OpenMixins from "@/common/mixins/openVideo-mixins.js";
import { mapState } from "vuex";
let defaultMarginBottom = 0
export default {
  mixins: [MescrollMixin, OpenMixins],
  components: { videoList, uploadGuide, scrollList },
  props: {
    show: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 0,
      defaultList: [],
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
      recordLen: 0,
      disableScroll: true,
      isBottom: true,
      templateList: [],
      tabs: [],
      tabIndex: 0,
    };
  },
  computed: {
    paddingTop() {
      return this.statusBarHeight + this.navBarHeight + "px";
    },
    ...mapState(["userinfo", "videoStatus"]),
  },
  watch: {
    isLogin(newVal, oldVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.mescroll.resetUpScroll();
        });
      }
    },
  },
  created(){
    this.$api.getTemplateCategory()
    .then(res => {
      this.tabs = res.data;
      this.$nextTick(() => {
        this.$refs.scrollListRef.downCallback();
      })
    })
  },
  mounted() {
    this.statusBarHeight = this.$statusBarHeight;
    this.navBarHeight = this.$navBarHeight;
    defaultMarginBottom = uni.upx2px(16);
  },
  methods: {
    chooseImage() {
      this.$emit("chooseImage");
    },
    _indexImg(url) {
      return this._img("index/" + url);
    },
    upCallback(page) {
      let datas = {
        current: page.num,
        size: page.size,
      };
      this.$api
        .getDefaultVideoPage(datas)
        .then((res) => {
          const curPageData = res.data.records || []; // 当前页数据
          const list = curPageData.map((item) => ({
            title: item.videoTitle,
            playUrl: item.videoUrl,
            id: item.id,
            imageUrl: item.videoCover,
            aiwxStatus: item.aiwxStatus,
          }));
          if (page.num === 1) this.defaultList = [];
          this.defaultList = this.defaultList.concat(list); //追加新数据
          if (this.defaultList.length > 6) this.isBottom = false;
          this.mescroll.endBySize(res.data.records.length, res.data.total);
          this.mescroll.endUpScroll(false);
        })
        .catch((err) => {
          this.mescroll.endErr();
        });
    },
    showMoreList() {
      if (this.isBottom) {
        return false;
      }
      this.disableScroll = false;
      this.$u.debounce(async () => {
        const data = this.mescroll.getScrollTop();
        if (!this.imgHeight) {
          this.imgHeight = await this.$refs.myVideoList.getImgHeight();
        }
        let scrollHeight = (this.imgHeight + defaultMarginBottom) * 2 + data;
        this.mescroll.scrollTo(scrollHeight, 300);
      }, 300);
    },
    scrollback() {
      this.$u.throttle(
        () => {
          const scrollTop = this.mescroll.getScrollTop();
          // 一屏的高度
          const viewHeight = (this.imgHeight + defaultMarginBottom) * 2;
          // 总高度
          const height =
            (this.imgHeight + defaultMarginBottom) * Math.ceil(this.defaultList.length / 3);
          if (scrollTop + viewHeight > height) {
            this.isBottom = true;
          } else {
            this.isBottom = false;
          }
        },
        10,
        false
      );
    },
    navToDetail(item) {
      const parmas = {
        videoType: "default",
        ...item,
      };
      this._openVideoPage(parmas);
    },
    /* 下拉刷新的回调 */
    downCallback() {
      this.mescroll.resetUpScroll();
    },
    upTempListCallback(page) {
      // let datas = {
      //   current: page.num,
      //   size: page.size,
      // };
      return new Promise((resolve, reject) => {
        this.$api
          .getTemplateVideoPage({
            typeId: this.$parent.tabs[this.$parent.tabIndex].id,
            ...page
          })
          .then((res) => {
            const curPageData = res.data.records || []; // 当前页数据
            const list = curPageData.map((item) => ({
              title: item.name,
              playUrl: item.videoUrl,
              id: item.id,
              imageUrl: item.imgUrl,
              aiwxStatus: item.status,
              time: item.createTime
            }));
            if (page.current === 1) this.$parent.templateList = [];
            this.$parent.templateList.push(...list); //追加新数据
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          });
      });
    },
    // 切换分类tab
    handleChangeTabs(event){
      const { dataset } = event.target;
      if(dataset.hasOwnProperty('index') && dataset.index !== this.tabIndex){
        this.tabIndex = dataset.index;
        this.$refs.scrollListRef.downCallback();
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.page {
  @include background-mixin(
    100%,
    // calc(100% - (148rpx + var(--padding-bottom, 10rpx)))
    calc(100% - (128rpx + var(--padding-bottom, 10rpx)))
  );

  min-height: 100vh;
  @include tabbar-page-bottom(padding-bottom, 104rpx);
  overflow-x: hidden;
  .template{
    margin: 30rpx 38rpx 40rpx 38rpx;
    .title{
      width: 384rpx;
      // margin-bottom: 34rpx;
      margin-bottom: 14rpx;

      .main-title {
        @include background-mixin;
        text-align: center;
        padding: 12rpx 36rpx 16rpx 32rpx;
        line-height: 32rpx;
      }
    }
    .tabs{
      height: 62rpx;
      width: 100%;
      margin-bottom: 20rpx;
      &-box{
        // flex-wrap: wrap;
        white-space: nowrap;
		    width: 100%;
        .item{
          // width: 156rpx;
          font-size: 36rpx;
          padding: 6rpx 42rpx;
          background: linear-gradient( 180deg, #FEF9E3 0%, #FFE7B3 100%);
          border-radius: 33rpx;
          border: 2rpx solid #CE7B3E;
          display: inline-block;
          margin-right: 14rpx;
          color: #D08E58;
          position: relative;
          height: 62rpx;
          &.active{
            border: none;
            background: linear-gradient( 180deg, #F3B286 0%, #FFE3CA 100%);
            color: #000000;
            .line{
              transform: translateX(-50%);
              left: 50%;
              width: 28rpx;
              height: 11rpx;
              bottom: 2rpx;

            }
          }
        }
      }
    }
  }
  .banner {
    @include background-mixin;
    margin: 0 20rpx;
    height: 1578rpx;
    z-index: 1;
    padding: 46rpx 16rpx;
    .huaquan-tag {
      font-size: 44rpx;
      margin-left: 2rpx;
      .huaquan-bg {
        width: 91rpx;
        height: 91rpx;
        left: 40rpx;
      }
      .main {
        letter-spacing: -10rpx;
      }
    }
    .title,
    .desc {
      margin-left: 20rpx;
      margin-top: 20rpx;
    }
    .desc {
      margin-bottom: 16rpx;
    }
    .product {
      margin-top: 32rpx;
      &-tag {
        padding-left: 20rpx;
        .icon {
          width: 86rpx;
          height: 72rpx;
        }
        text {
          margin-left: -10rpx;
        }
      }
      &-info {
        margin-top: 10rpx;
        width: 686rpx;
        height: 424rpx;
      }
    }
    .banner-icon,
    .yun-left,
    .yun-right {
      position: absolute;
      z-index: 1;
    }
    .banner-icon {
      left: 587rpx;
      top: -22rpx;
      width: 178rpx;
      height: 178rpx;
      z-index: 2;
    }
    .yun-left {
      left: -18rpx;
      bottom: 380rpx;
      width: 164rpx;
      height: 286rpx;
    }
    .yun-right {
      right: -18rpx;
      top: -271rpx;
      width: 158rpx;
      height: 350rpx;
    }
  }
  // .bottom-bg{
  //   bottom: 74rpx;
  //   // @include tabbar-page-bottom(bottom);
  //   left: 0;
  //   width: 750rpx;
  //   height: 572rpx;
  // }
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
</style>