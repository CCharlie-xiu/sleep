<template>
  <u-popup
    v-model="show"
    mode="bottom"
    class="login"
    borderRadius="50"
    :safe-area-inset-bottom="false"
    :mask-close-able="!showMask || maskCloseAble"
    @close="close"
    :customStyle="{ 'touch-action': 'none' }"
    duration="150"
  >
    <view
      class="login-content"
      :style="[
        {
          backgroundImage: `url(${_img(
            wxLogin ? 'common/bg_login.png' : 'common/bg_login_phone.png'
          )})`,
        },
      ]"
    >
      <view class="login-content-img">
        <image :src="_img('common/icon_loginLogo.png')" />
      </view>
      <bolck v-if="wxLogin">
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="wx-btn ai-primary-btn ai-flex ai-flex-center family-albb-regular"
          open-type="getPhoneNumber"
          @getphonenumber="getPhoneNumber"
        >
          手机号授权登录
        </button>
        <!-- #endif -->
        <view
          class="login-content-change family-albb-regular"
          @click="wxLogin = false"
          ><text>短信验证码登录</text>
          <u-icon class="icon" name="arrow-right"></u-icon></view
      ></bolck>
      <bolck v-else>
        <view class="login-content-code">
          <view class="loginCode-input border-bottom ai-flex">
            <view class="loginCode-input-number">
              <u-input
                type="number"
                class="family-hw-regular"
                maxlength="11"
                v-model="form.tel"
                closeable
                placeholder="请输入手机号"
                placeholderStyle="color: #565759;"
              />
            </view>
          </view>
          <view class="loginCode-input border-bottom ai-flex ai-flex-between">
            <view class="loginCode-input-number">
              <u-input
                type="number"
                class="family-hw-regular"
                maxlength="6"
                v-model="form.code"
                placeholder="请输入验证码"
                placeholderStyle="color: #565759;"
              />
            </view>
            <custom-sms-code
              ref="smsCode"
              :phone="form.tel"
              :apiFun="getCode"
            />
          </view>
          <view
            class="loginCode-protocolBox ai-flex ai-flex-center family-albb-regular"
          >
            <u-checkbox
              v-model="signPrivacy"
              shape="circle"
              class="loginCode-protocolBox-radio"
              size="28"
              active-color="#D68C51"
              :label-disabled="false"
            >
              <span class="u-font-26">
                我同意<span
                  class="loginCode-protocolBox-name"
                  @click.stop="handleToAnswerPage('用户协议')"
                >
                  《用户服务协议》 </span
                >和<span
                  class="loginCode-protocolBox-name"
                  @click.stop="handleToAnswerPage('隐私协议')"
                >
                  《隐私政策》
                </span>
              </span>
            </u-checkbox>
          </view>
          <button
            class="loginCode-btn ai-primary-btn ai-flex ai-flex-center family-albb-semiBold"
            @click="phoneLogin"
          >
            登录
          </button>
          <view
            class="login-content-change family-albb-regular"
            @click="wxLogin = true"
            ><text>手机号授权登录</text>
            <u-icon class="icon" name="arrow-right"></u-icon
          ></view>
        </view>
      </bolck>
    </view>
    <u-mask
      :show="showMask"
      :custom-style="{
        background: 'rgba(0, 0, 0, 0)',
      }"
      :mask-click-able="false"
    ></u-mask>
  </u-popup>
</template>
        
<script>
import ToAnswerPageMixin from '@/common/mixins/toAnswerPage-mixins.js';
export default {
  mixins: [ToAnswerPageMixin],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      signPrivacy: false,
      show: this.value || false,
      wxLogin: true,
      form: {
        tel: "",
        code: "",
      },
      isGetCode: false,
      showMask: false,
      maskCloseAble: false,
    };
  },
  watch: {
    value(val) {
      this.show = val;
      this.loading = false;
      if(val){
        setTimeout(() => {
          this.maskCloseAble = this.showMask;
        }, 180);
      }else{
        this.maskCloseAble = false;
      }
    },
    show(val) {
      this.$emit("input", val);
      this.$emit("change", val);
    },
    wxLogin(val) {
      if (val) {
        this.form.tel = "";
        this.form.code = "";
        this.signPrivacy = false;
      }
    },
    showMask(val){
      this.maskCloseAble = val;
    }
  },
  methods: {
    getPhoneNumber(e) {
      const { code } = e.detail || e;
      if (code) {
        const params = {
          code: code,
        };
        this.login(params);
      }
    },
    codeChange(text) {
      this.tips = text;
    },
    async getCode() {
      this.showMask = true;
      this.$api
        .getSMScode({
          phoneNum: this.form.tel,
        })
        .then((res) => {
          this.$refs.smsCode.codeStart();
          this.$Tips.toast("验证码已发送");
          this.isGetCode = true;
        })
        .catch((err) => {
          this.$Tips.toast(err.data.msg || "验证码发送失败");
        })
        .finally(() => {
          this.showMask = false;
        });
    },
    // 登录
    phoneLogin() {
      if (!this.$u.trim(this.form.tel)) {
        this.$Tips.toast("手机号不能为空");
        return false;
      } else {
        if (!this.$u.test.mobile(this.form.tel)) {
          this.$Tips.toast("请输入正确手机号");
          return false;
        }
      }
      // if (!this.isGetCode) {
      //   this.$Tips.toast("请先获取验证码");
      //   return false;
      // }
      if (!this.$u.trim(this.form.code)) {
        this.$Tips.toast("验证码不能为空");
        return false;
      } else {
        if (this.form.code.length < 4 || this.form.code.length > 6) {
          this.$Tips.toast("请输入正确验证码");
          return false;
        }
      }
      if (!this.signPrivacy) {
        this.$Tips.toast("请阅读并接受《用户协议》和《隐私协议》");
        return false;
      }
      const params = {
        phoneNum: this.form.tel,
        verifySms: this.form.code,
        signPrivacy: this.signPrivacy ? 1 : 0,
      };
      this.login(params);
    },
    login(params) {
      this.showMask = true;
      this.$api
        .login(params)
        .then((res) => {
          let userinfo = res.data;
          userinfo.expiredTime =
            new Date().getTime() + parseInt(userinfo.expires) * 1000;
          if (!this.wxLogin && this.form.tel) {
            userinfo.phoneNum = this.form.tel;
          }
          // userinfo.orderStatus = 1;
          userinfo && this.$store.dispatch("set_token", userinfo.accessToken);
          userinfo && this.$store.dispatch("set_userinfo", userinfo);
          this.$Tips.toast("登录成功");
          this.show = false;
        })
        .catch((err) => {
          let msg = err.msg || err.data.msg;
          if(typeof msg === 'string'){
            msg.indexOf('验') > -1 && (msg = '短信验证失败!')
          }
          this.$Tips.toast(msg || '登录失败');
        })
        .finally(() => {
          this.showMask = false;
        });
    },
    close() {
      this.wxLogin = true;
      this.isGetCode = false;
      this.$emit("close");
    },
  },
};
</script>
        
<style lang="scss" scoped>
.login {
  .login-content {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .login-content-img {
      padding-top: 104rpx;
      display: flex;
      & > image {
        width: 228rpx;
        height: 82rpx;
        margin: 0 auto;
      }
    }
    .wx-btn {
      margin: 48rpx auto 0 auto;
      width: 570rpx;
      height: 96rpx;
      font-weight: 600;
    }
    .login-content-change {
      text-align: center;
      padding: 32rpx 0 96rpx 36rpx;
      & > text {
        font-weight: normal;
        font-size: 28rpx;
        color: #666666;
        font-style: 400;
        text-transform: none;
      }
      .icon {
        padding-left: 10rpx;
        font-size: 24rpx;
        color: #666666;
      }
    }
    .login-content-code {
      padding: 34rpx 90rpx 8rpx 90rpx;
      .loginCode-input {
        height: 88rpx;
        margin-top: 40rpx;
        border-bottom: 3rpx solid #e2dcd2;
        .loginCode-input-number {
          flex: 1;
          & > input {
            font-weight: 500;
            font-size: 28rpx;
            color: #626262;
          }
        }
      }
      .loginCode-protocolBox {
        margin-top: 58rpx;
        font-size: 26rpx;
        font-weight: 400;
        color: #666666;
        font-weight: 400;
        &-radio {
          display: block;
          margin-right: 10rpx;
        }
        &-name {
          color: #000000;
          font-weight: 500;
        }
      }
      .loginCode-btn {
        margin-top: 32rpx;
        height: 96rpx;
        border-radius: 48rpx;
        font-weight: 600;
        font-size: 34rpx;
        color: #ffffff;
        text-align: center;
      }
    }
  }
}
</style>
        