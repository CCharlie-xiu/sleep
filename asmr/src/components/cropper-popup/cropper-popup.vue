<template>
  <view>
    <!-- 图片上传提示 -->
    <view class="upload-tip family-albb-regular">
      <u-popup
        v-model="uploadTipModal"
        mode="bottom"
        :mask-close-able="false"
        :mask-custom-style="{
          background: 'rgba(0, 0, 0, 0.95)',
        }"
        duration="200"
        :height="uploadTipModalHeight"
      >
        <view
          class="upload-tip-pop"
          :style="[
            {
              backgroundImage: `url(${_uploadImg('upload-tip-bg.jpg')})`,
            },
          ]"
        >
          <view @click="uploadTipModal = false" class="close-able"> </view>

          <view class="item">
            <view class="title family-albb-black"> 形象示例 </view>
            <view class="figure u-flex">
              <img
                class="banner"
                :src="_uploadImg('figure-tip-right.jpg')"
                mode="widthFix"
              />
              <img
                class="yun"
                :src="_uploadImg('upload-tip-yun.png')"
                mode="widthFix"
              />
              <view class="figure-list u-flex-col">
                <view v-for="(item, index) in figureTipList" :key="index">
                  <img class="icon" :src="_uploadImg('checked.png')" />
                  {{ item }}
                </view>
              </view>
            </view>
          </view>
          <view class="item">
            <view class="title family-albb-black"> 错误示范 </view>
            <view class="error u-flex">
              <view
                class="error-item u-flex-col"
                v-for="(item, index) in errTipList"
                :key="index"
              >
                <img
                  class="err-img"
                  :src="_uploadImg('upload-tip-err-' + (index + 1) + '.png')"
                  mode="widthFix"
                />
                {{ item }}
                <view class="close-icon"></view>
              </view>
            </view>
          </view>
          <view class="button u-flex u-row-between">
            <u-button
              :custom-style="btnStyle"
              ripple
              shape="circle"
              :hair-line="false"
              @click="handleChooseImage('camera')"
            >
              去拍照
            </u-button>
            <u-button
              :custom-style="{
                ...btnStyle,
                background: '#D68C51',
                color: '#fff',
                marginLeft: '32rpx',
                border: 'none',
                fontWeight: 'normal',
                fontFamily: 'AlibabaPuHuiTi-3-85-Bold',
              }"
              ripple
              :hair-line="false"
              shape="circle"
              @click="handleChooseImage('album')"
            >
              相册选择
            </u-button>
          </view>
          <view class="tip u-text-center u-font-24 color-666666">
            上传即视为您已同意
            <text @click="handleToAnswerPage('上传图片须知')">
              《上传图片须知》
            </text>
          </view>
        </view>
      </u-popup>
    </view>
    <!-- 裁剪 -->
    <u-popup v-model="croperModal" mode="right" width="100%" height="100%"
    :mask-close-able="false">
      <qf-image-cropper
        :width="cropProperty.width"
        :height="cropProperty.height"
        :radius="0"
        :navigation="false"
        :src="tempImagePath"
        gpu
        :navbarHeight="paddingTop"
        @cancel="handleCancelCrop"
        @changeCropProperty="handleChangeCropProperty"
        @crop="handleCrop"
      ></qf-image-cropper>
    </u-popup>
  </view>
</template>

<script>
import ToAnswerPageMixin from '@/common/mixins/toAnswerPage-mixins.js';
import { INIT_CROP_PROPERTY } from "@/common/data/constants.js";
export default {
  mixins: [ToAnswerPageMixin],
  props: {
    uploadTipModalVal: {
      type: Boolean,
      default: false,
    },
    croperModalVal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 0,
      uploadTipModal: this.uploadTipModalVal || false,
      uploadTipModalHeight: "auto",
      figureTipList: ["正面站立", "全身照", "身体无遮挡", "无俯仰角"],
      errTipList: ["侧脸侧身", "光线暗淡", "收纳物品", "复杂背景"],
      tempImagePath: "",
      croperModal: this.croperModalVal || false,
      cropProperty: {
        ...INIT_CROP_PROPERTY,
      },
      sourceType: "",
    };
  },
  computed: {
    btnStyle() {
      return {
        border: "2rpx solid #BD6621",
        background: "transparent",
        flex: "1",
        height: "88rpx",
        color: "#A74C04",
        fontSize: "32rpx",
        fontWeight: "bold",
        width: "286rpx",
        fontFamily: "HarmonyOS_Sans_Black",
      };
    },
    paddingTop() {
      return this.statusBarHeight + this.navBarHeight + "px";
    },
  },
  watch: {
    uploadTipModalVal(val) {
      this.uploadTipModal = val;
    },
    uploadTipModal(val) {
      this.$emit("update:uploadTipModalVal", val);
    },
    croperModalVal(val) {
      this.croperModal = val;
    },
    croperModal(val) {
      this.$emit("update:croperModalVal", val);
    },
  },
  mounted() {
    this.statusBarHeight = this.$statusBarHeight;
    this.navBarHeight = this.$navBarHeight;
    if (uni.upx2px(1422) > this.$windowHeight) {
      this.uploadTipModalHeight =
        this.$windowHeight -
        this.$navBarHeight -
        this.$statusBarHeight -
        uni.upx2px(60) +
        "px";
    }
  },
  methods: {
    // 裁剪成功回调
    handleCrop(e) {
      console.debug("handleCrop #debug =======>", e);
      const file = e.tempFilePath;
      if(file){
        this.$emit('handleCroped', file)
      }
      this.$nextTick(() => {
        uni.hideLoading();
      })
      this.croperModal = false;
    },
    // 打开上传提示弹窗
    handleOpenUploadTipModal() {
      // 是否登录
      if (!this.isLogin) {
        this.isLoginEdChooseImage = true;
        this.loginModal = true;
        return;
      }
      // 是否办理业务
      if (this.userinfo.orderStatus != 1) {
        this.bizModal = true;
        return;
      }
      const { progress } = this.uploadCard;
      if (progress <= 100 && progress > 0) {
        return;
      }
      this.uploadTipModal = true;
    },
    // 裁剪参数变化
    handleChangeCropProperty(cropProperty) {
      this.cropProperty = cropProperty;
    },
    // 取消裁剪
    handleCancelCrop() {
      this.croperModal = false;
      // this.uploadTipModal = true;
    },
    // 选择图片
    handleChooseImage(sourceType) {
      // this.sourceType = sourceType;
      // 裁剪参数回到初始值
      this.cropProperty = {
        ...INIT_CROP_PROPERTY,
      };
      uni.chooseImage({
        count: 1,
        // sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: sourceType ? [sourceType] : ["camera", "album"],
        success: (res) => {
          // console.log(JSON.stringify(res.tempFilePaths));
          this.uploadTipModal = false;
          this.tempImagePath = res.tempFilePaths[0];
          this.$nextTick(() => {
            this.croperModal = true;
          })
        },
      });
    },
    _uploadImg(url) {
      return this._img("upload/" + url);
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-tip {
  .upload-tip-pop {
    @include background-mixin();
    // height: 1422rpx;
    border-radius: 88rpx 88rpx 0 0;
    padding: 58rpx 48rpx;
    .item {
      margin-bottom: 40rpx;
      .title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 24rpx;
        padding: 0;
      }
      .figure {
        height: 534rpx;
        background-color: #fff;
        border-radius: 36rpx 24rpx 24rpx 36rpx;
        position: relative;
        .banner {
          width: 346rpx;
          height: 536rpx;
          border-radius: 24rpx;
          vertical-align: middle;
        }
        &-list {
          margin-left: 52rpx;
          // justify-content: space-evenly;
          padding-top: 90rpx;
          height: 536rpx;
          font-size: 32rpx;
          color: #474747;
          view {
            display: flex;
            align-items: center;
            margin-bottom: 46rpx;
            .icon {
              width: 36rpx;
              height: 36rpx;
              margin-right: 18rpx;
            }
          }
        }
        .yun {
          position: absolute;
          width: 228rpx;
          height: 228rpx;
          left: 452rpx;
          top: 404rpx;
        }
      }
      .error {
        font-size: 22rpx;
        margin-bottom: 80rpx;
        &-item {
          position: relative;
          flex: 1;
          align-items: center;
          // justify-content: center;
          .err-img {
            width: 128rpx;
            height: 226rpx;
            margin-bottom: 8rpx;
          }
          .close-icon {
            position: absolute;
            z-index: 1;
            left: 100rpx;
            top: 178rpx;
            width: 48rpx;
            height: 48rpx;
            transform: rotate(45deg);
            border-radius: 48rpx;
            background-color: #bb6c00;
            &::before,
            &::after {
              content: "";
              position: absolute;
              background: #fff;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
            &::before {
              width: 24rpx;
              height: 2rpx;
            }
            &::after {
              width: 2rpx;
              height: 24rpx;
            }
          }
        }
      }
    }
    .tip {
      // margin: 62rpx auto 0;
      // width: 604rpx;
      padding: 62rpx 40rpx 0 40rpx;
      // width: 602rpx;
      width: 100%;
      text{
        color: #D68C51;
      }
    }
    .button {
      padding: 0 24rpx;
    }
  }
  .close-able {
    position: absolute;
    z-index: 1;
    right: 48rpx;
    top: 28rpx;
    width: 72rpx;
    height: 72rpx;
    transform: rotate(45deg);
    border-radius: 72rpx;
    &::before,
    &::after {
      content: "";
      position: absolute;
      background: #000;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    &::before {
      width: 36rpx;
      height: 2rpx;
    }
    &::after {
      width: 2rpx;
      height: 36rpx;
    }
  }
}
</style>