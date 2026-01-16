<template>
  <view>
    <u-popup v-model="show" mode="center" borderRadius="50" height="100%"
    :duration="show ? 100 : 50">
      <view
        class="prod u-rela"
        :style="[
          {
            backgroundImage: `url(${_img('common/bg_prod.png')})`,
          },
        ]"
      >
        <view class="prod-content">
          <view class="prod-content-title u-flex u-row-between">
            <view class="prod-content-title-left"
              ><view>产品</view><view>权益</view></view
            >
            <view class="prod-content-title-center family-albb-regular">
              <view>赠送默认舞蹈视频</view>
              <view>AI自动用我的照片制作舞蹈视频</view>
            </view>
            <view class="prod-content-title-right family-albb-semiBold"
              ><text class="u-font-34 num">{{expenses}}</text
              ><text class="text">元/月</text></view
            >
          </view>
          <view class="prod-content-body">
            <view class="prod-content-body-phone family-albb-bold">
              <text>支付手机号码：</text>
              <text>{{ phoneEncrypt }}</text>
            </view>
          </view>
          <view class="prod-input border-bottom ai-flex ai-flex-between">
            <view class="prod-input-number">
              <u-input
                type="number"
                maxlength="6"
                v-model="code"
                placeholder="请输入验证码"
              />
            </view>
            <custom-sms-code
              ref="smsCode"
              :phone="userinfo.phoneNum"
              :codeBoxStyle="{
                width: '180rpx',
                background: '#ffffff',
                'border-radius': '32rpx',
                'font-weight': '500',
                'font-size': '24rpx',
                color: '#8a3d00',
                padding: '16rpx 24rpx',
              }"
              :apiFun="getCode"
            />
          </view>
          <view class="prod-protocolBox ai-flex ai-flex-center">
            <u-checkbox
              v-model="signPrivacy"
              shape="circle"
              class="prod-protocolBox-radio"
              size="28"
              active-color="#D68C51"
              :label-disabled="false"
            >
              <view class="family-albb-regular prod-protocolBox-label">
                我同意<text
                  class="prod-protocolBox-name"
                  @click.stop="handleToAnswerPage('用户协议')"
                >
                  《用户服务协议》 </text
                >和<text
                  class="prod-protocolBox-name"
                  @click.stop="handleToAnswerPage('隐私协议')"
                >
                  《隐私政策》
                </text>
              </view>
            </u-checkbox>
          </view>
          <button
            :loading="loading"
            class="prod-btn ai-primary-btn ai-flex ai-flex-center family-albb-bold"
            @click="confirmOrder"
          >
            立即开通
          </button>
        </view>
        <view class="prod-close" @click="show = false">
          <image class="prod-close-img" :src="_img('common/icon_close.png')" />
        </view>
      </view>
    </u-popup>
    <message-modal
      v-model="bizSuccessModal"
      :showCancelBtn="false"
      confirmBtnText="去上传照片"
      bgPath="common/biz-success-bg2.png"
      :mainStyle="{
        width: '682rpx',
        height: '495rpx',
        paddingTop: '80rpx',
        'justify-content': 'flex-start',
      }"
      :confirmBtnStyle="{
        width: '534rpx',
        fontSize: '36rpx',
      }"
      :closeBtnStyle="{
        left: '49%',
        top: '105%',
        transform: 'rotate(45deg) translateX(-50%)',
      }"
      @confirm="handleBizSuccess"
    >
      <view slot="contentMiddle" class="theme-family u-font-48">
        恭喜开通成功！
      </view>
      <view
        slot="contentBottom"
        class="u-font-28 margin-top margin-bottom-xs u-flex-col u-col-center family-hw-medium"
      >
        <text class="margin-bottom-xs">去上传照片，上传后AI会自动</text>
        <text>帮我制作丰富的舞蹈视频</text>
      </view>
    </message-modal>
    <img
      :src="_img('common/bg_prod.png')"
      v-if="!hidden"
      style="position: absolute; left: 999px; top: 999px"
    />
  </view>
</template>
        
<script>
import ToAnswerPageMixin from '@/common/mixins/toAnswerPage-mixins.js';
import { appID } from "@/common/initModule/mpInit.js";
import { mapState } from "vuex";
import { phoneEncrypt } from "@/common/utils/util.js";
// API 调用已移除 - getAiWxCode, createAiWxOrder, getQueryInfo
import { isDebug } from '@/common/data/staticData';
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
      loading: false,
      code: "",
      isGetCode: false,
      bizSuccessModal: false,
      hidden: false,
      mode: "zt",
      productInfo: null,

    };
  },
  computed: {
    ...mapState(["userinfo", "planInfo", "token"]),
    phoneEncrypt() {
      return this.userinfo && phoneEncrypt(this.userinfo.phoneNum);
    },
    expenses(){
      if(this.planInfo && this.planInfo.money){
        if(typeof this.planInfo.money === 'string'){
          return this.planInfo.money.split('.')[0]
        }else{
          return this.planInfo.money
        }
      }
      return ''
    }
  },
  watch: {
    value(val) {
      this.show = val;
      if(val){
        this.loading = false;
      }
    },
    show(val) {
      this.$emit("input", val);
      this.$emit("change", val);
    },
  },
  created() {
    setTimeout(() => {
      this.hidden = true;
    }, 100);
  },
  methods: {
    getCode() {
      this.isGetCode = false;
      this[this.mode + "GetCode"]();
    },
    async ztGetCode() {
      try {
        const productRes = await getQueryInfo({
          planId: this.planInfo.planId,
          phone: this.userinfo.phoneNum,
        });
        this.productInfo = {
          ...productRes.data.baseData,
          ...productRes.data.upData,
        };
        if (this.productInfo.goodsId) {
          const res = await getAiWxCode({
            Authorization: this.token,
            planId: this.planInfo.planId,
            srcPrdId: this.productInfo.goodsId,
            srcId: this.planInfo.channelId,
            mobile: this.userinfo.phoneNum,
            landingPageId: this.planInfo.landingPageId,
          });
          this.isGetCode = true;
          if(isDebug){
            this.msgParseCode(res);
          }else{
            this.$Tips.toast("验证码已发送");
          }
          this.$refs.smsCode.codeStart();
        } else {
          this.productInfo = null;
          this.$Tips.toast("暂无可办理业务");
        }
      } catch (err) {
        this.code = "";
        this.$Tips.toast(err.msg || err.data.msg);
      }
    },
    eqtGetCode() {
      this.$api
        .getOrderConfirmCode({
          appId: appID,
          phoneNum: this.userinfo.phoneNum,
        })
        .then((res) => {
          this.isGetCode = true;
          this.$Tips.toast("验证码已发送");
          this.$refs.smsCode.codeStart();
        })
        .catch((err) => {
          this.$Tips.toast(err.msg || err.data.msg);
        });
    },
    // 确定订购
    confirmOrder() {
      if(this.loading) return;
      this.$u.debounce(() => {
        if (!this.$u.trim(this.userinfo.phoneNum)) {
          this.$Tips.toast("手机号不能为空");
          return false;
        } else {
          if (!this.$u.test.mobile(this.userinfo.phoneNum)) {
            this.$Tips.toast("请输入正确手机号");
            return false;
          }
        }
        if (!this.isGetCode) {
          this.$Tips.toast("请先获取验证码");
          return false;
        }
        if (!this.$u.trim(this.code)) {
          this.$Tips.toast("验证码不能为空");
          return false;
        } 
        if (this.code.length < 4 || this.code.length > 6) {
          this.$Tips.toast("请输入正确验证码");
          return false;
        }
        if (!this.signPrivacy) {
          this.$Tips.toast("请阅读并接受《用户协议》和《隐私协议》");
          return false;
        }
        this[this.mode + "Order"]();
      }, 300);
    },
    async ztOrder() {
      try {
        if(!this.productInfo){
          this.$Tips.toast('请先获取验证码!');
          return
        }
        this.loading = true;
        await createAiWxOrder({
          Authorization: this.token,
          planId: this.planInfo.planId,
          srcPrdId: this.productInfo.goodsId,
          srcId: this.planInfo.channelId,
          mobile: this.userinfo.phoneNum,
          landingPageId: this.planInfo.landingPageId,
          flowingWaterId: "",
          transTime: new Date().getTime(),
          smsPwd: this.code,
          signPrivacy: this.signPrivacy ? 1 : 0,
        });
        const updataUserInfo = this.userinfo;
        updataUserInfo.orderStatus = 1;
        updataUserInfo && this.$store.dispatch("set_userinfo", updataUserInfo);
        this.code = "";
        this.signPrivacy = false;
        this.show = false;
        this.bizSuccessModal = true;
      } catch (err) {
        this.loading = false;
        let msg = err.msg || err.data.msg;
        typeof msg === 'string' && msg.indexOf('验') > -1 && (msg = '短信验证失败!');
        this.$Tips.toast(msg);
      } 
    },
    eqtOrder() {
      this.$api
        .confirmOrder({
          appId: appID,
          phoneNum: this.userinfo.phoneNum,
          verifyCode: this.code,
        })
        .then((res) => {
          this.show = false;
          this.bizSuccessModal = true;
        })
        .catch((err) => {
          this.$Tips.toast(err.msg || err.data.msg);
        });
    },
    handleBizSuccess() {
      this.bizSuccessModal = false;
      this.$emit("confirmBizModal");
    },
    msgParseCode(res){
      if(res.data && res.data.aopLogParams && res.data.aopLogParams.ask && res.data.aopLogParams.ask.return){
          const reg = /验证码：(.*?)，/;
          const code = reg.exec(res.data.aopLogParams.ask.return)[1];
          this.code = code;
          this.$Tips.toast("验证码: " + code);
        }else{
          this.$Tips.toast("验证码已发送");
        }
        console.error('获取验证码报文 ======> ', res.data);
    }
  },
};
</script>
        
<style lang="scss" scoped>
.prod {
  width: 750rpx;
  height: 689rpx;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  .prod-content {
    padding-top: 39rpx;
    .prod-content-title {
      margin: 0 113rpx;
      &-left {
        flex-shrink: 0;
        font-weight: 600;
        font-size: 28rpx;
        color: #ffffff;
        line-height: 30rpx;
        margin-right: 20rpx;
        font-style: italic;
      }
      &-center {
        font-weight: 500;
        font-size: 24rpx;
        color: #ffffff;
        margin-right: 26rpx;
        text-transform: none;
        flex: 1;
      }
      &-right {
        flex-shrink: 0;
        color: #ffffff;
        .text {
          font-weight: 500;
          font-size: 18rpx;
        }
        .num {
          font-weight: 600;
        }
      }
    }
    .prod-content-body-phone {
      font-weight: 600;
      font-size: 32rpx;
      color: #333333;
      line-height: 32rpx;
      text-align: center;
      margin-top: 92rpx;
    }
    .prod-input {
      width: 582rpx;
      height: 96rpx;
      margin-top: 22rpx;
      border: 2rpx solid #b08181;
      border-radius: 14rpx;
      margin: 22rpx auto 0 auto;
      padding: 0 24rpx;
      .prod-input-number {
        flex: 1;
        & > input {
          font-weight: 500;
          font-size: 28rpx;
          color: #626262;
        }
      }
      .prod-input-code {
        width: 180rpx;
        background: #ffffff;
        border-radius: 32rpx;
        font-weight: 500;
        font-size: 24rpx;
        color: #8a3d00;
        padding: 16rpx 24rpx;
      }
    }
    .prod-protocolBox {
      margin-top: 20rpx;
      &-label {
        font-size: 26rpx;
        font-weight: 400;
        color: #666666;
      }
      &-radio {
        display: block;
        margin-right: 10rpx;
      }
      &-name {
        color: #000;
        font-weight: 500;
      }
    }
    .prod-btn {
      margin: 44rpx 84rpx 0;
      height: 96rpx;
      border-radius: 48rpx;
      font-weight: 600;
      font-size: 34rpx;
      color: #ffffff;
    }
  }
  .prod-close {
    position: absolute;
    bottom: -24rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 72rpx;
    height: 72rpx;
    .prod-close-img {
      width: 72rpx;
      height: 72rpx;
    }
  }
}
</style>