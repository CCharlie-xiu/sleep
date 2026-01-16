<template>
  <view class="page login rela" :style="[$cssVar]">
    <custom-navbar> </custom-navbar>
    <view class="pt-60 w-100 rela">
      <view class="px-60 tn-flex-column">
        <view class="tn-flex-center-center my-60 login-logo">
          <image
            class="logo-image"
            :src="`${$staticPath.common}/logo.png`"
            mode="widthFix"
          />
        </view>

        <template v-if="authLogin">
          <tn-button
            class="tn-flex-center-center"
            customClass="font-size-34 font-weight-6 font-color-v1 bg-color-v11 tn-flex-center-center mx-auto"
            :customStyle="{
              'border-radius': '48rpx',
              padding: '30rpx 194rpx',
            }"
            :open-type="openType"
            @click="handleGetPhoneNumber"
            @getphonenumber="handleGetPhoneNumber"
          >
            手机号快捷登录
          </tn-button>
        </template>
        <template v-else>
          <view class="mt-24 login-border">
            <tn-input
              type="number"
              class="font-color-v21 font-weight-5 font-size-36"
              :maxlength="11"
              v-model="form.tel"
              :underline="true"
              :border="false"
              placeholder="请输入手机号"
              <!-- #ifdef MP-KUAISHOU -->
              :placeholderStyle="{ color: $themeConfig.var_font_v21_color }"
              <!-- #endif -->
              >
              <template #prefix>
                <view class="tn-flex-center-center">
                  <view class="font-color-v21 mr-40">+86</view>
                  <tn-icon name="down-triangle" />
                </view>
              </template>
            </tn-input>
          </view>
          <view class="mt-24 login-border">
            <tn-input
              type="number"
              class="font-color-v21 font-weight-5 font-size-36"
              v-model="form.code"
              :underline="true"
              :border="false"
              maxlength="6"
              placeholder="请输入验证码"
              <!-- #ifdef MP-KUAISHOU -->
              :placeholderStyle="{ color: $themeConfig.var_font_v21_color }"
              <!-- #endif -->
              >
              <template #suffix>
                <custom-sms-code :phone="form.tel" apiName="getSmsCode" />
              </template>
            </tn-input>
          </view>
          <button
            class="login-btn mt-64 font-size-34 font-weight-6 font-color-v1 bg-color-v11 tn-flex-center-center"
            hover-class="hover-class"
            @click="phoneLogin()"
          >
            登录
          </button>
        </template>
        <view class="mt-32 tn-flex-center-center">
          <tn-checkbox
            v-model="signPrivacy"
            checked-shape="circle"
            size=""
            :active-color="$themeConfig.var_bg_v43_color"
            :label-disabled="false"
          >
            <text class="font-size-22 ml-16 font-color-v50 tn-flex items-start">
              我同意<text
                class="font-color-v51"
                @click.stop="handleToAnswerPage('userAgreement')"
              >
                《用户协议》
              </text>
              <text> 和 </text>
              <text
                class="font-color-v51"
                @click.stop="handleToAnswerPage('privacyAgreement')"
              >
                《隐私政策》
              </text>
            </text>
          </tn-checkbox>
        </view>
        <view
          hover-class="hover-class"
          @click="$Router.back()"
          class="skip abso font-size-28 font-weight-300 font-color-v21"
          >暂时跳过</view
        >
      </view>
    </view>
    <!-- #ifndef MP-WEIXIN || APP-PLUS -->

    <view
      v-if="authLogin"
      class="login-otherLogin font-color-v50 abso font-size-20 font-weight-4"
      ><view class="tn-flex-center-center">
        <view class="login-line"></view>
        <view class="mx-20">其他登录方式</view>
        <view class="login-line"></view>
      </view>
      <view
        v-if="authLogin"
        class="tn-flex-center-center mt-30"
        @click="authLogin = false"
      >
        <image
          class="btn-image mr-16"
          :src="`${$staticPath.mine}/phone-login-icon.png`"
        />
      </view>
      <view
        v-else
        class="tn-flex-center-center mt-30"
        @click="authLogin = true"
      >
        <!-- #ifdef MP-TOUTIAO -->
        <image
          class="btn-image mr-16"
          :src="`${$staticPath.mine}/dy-login-icon.png`"
        />
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <image
          class="btn-image mr-16"
          :src="`${$staticPath.mine}/wx-login-icon.png`"
        />
        <!-- #endif -->
      </view>
    </view>

    <!-- #endif -->

    <agreeheck
      v-model="agreeheckVisible"
      @handleLogin="handleLogin"
      :openType="agreeOpenType"
      @handleGetPhoneNumber="handleGetPhoneNumber"
    />
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import { appID, initMemberInfo } from "@/common/initModule/mpInit.js";
import { useUserStore } from "@/store/user.js";
import { PLATFORMENUM } from "@/common/data/constants.js";
import { validatePhone } from "@/common/utils/util";
import agreeheck from "@/pages/login/components/agree-check.vue";
import usePositionJump from "@/hooks/usePostionJump";
import { website } from "@/common/data/constants.js";
import { useaAppConfigStore } from "@/store/appConfig";
const { proxy } = getCurrentInstance();
const { config } = storeToRefs(useaAppConfigStore());
const { projectId } = config;

const { handleToAnswerPage } = usePositionJump();

const form = ref({});
const authLogin = ref(
  typeof config.value.authLogin === "string"
    ? config.value.authLogin === "true"
    : true
);
// #ifdef APP-PLUS
authLogin.value = false;
// #endif

const signPrivacy = ref(false);
const smsCode = ref(null);
const { setNextPage, SET_TOKEN, SET_REFRESH_TOKEN, SET_USER_INFO } =
  useUserStore();
const { nextPage } = storeToRefs(useUserStore());
const agreeheckVisible = ref(false);
const handleOpen = () => {
  console.debug("handle #debug =======>");
};

const openType = ref("");
const agreeOpenType = ref("");

const params = ref({});
const handleGetPhoneNumber = (e) => {
  // 校验隐私协议
  if (!signPrivacy.value) {
    // proxy.$Tips.toast("请阅读并接受相关协议");
    agreeOpenType.value = "getPhoneNumber";
    agreeheckVisible.value = true;
    return false;
  } else {
    agreeOpenType.value = "";
  }
  const { code } = e.detail || e;
  if (!code) return;
  params.value = {
    code: code,
    grant_type: "social",
    projectId: projectId,
    source: PLATFORMENUM,
    scope: website.scope,
  };
  login(params.value);
};

// 手机号登录
const phoneLogin = () => {
  // 校验手机号
  if (!form.value.tel || !form.value.tel.trim()) {
    proxy.$Tips.toast("手机号不能为空");
    return false;
  }
  if (!validatePhone(form.value.tel)) {
    proxy.$Tips.toast("请输入正确手机号");
    return false;
  }

  // 校验验证码
  if (!form.value.code || !form.value.code.trim()) {
    proxy.$Tips.toast("验证码不能为空");
    return false;
  }
  if (form.value.code.length < 4 || form.value.code.length > 6) {
    proxy.$Tips.toast("请输入正确验证码");
    return false;
  }
  params.value = {
    code: form.value.code,
    phone: form.value.tel,
    grant_type: "sms_code",
    projectId: projectId,
    source: PLATFORMENUM,
    scope: website.scope,
  };

  // 校验隐私协议
  if (!signPrivacy.value) {
    agreeheckVisible.value = true;
    openType.value = "";
    return false;
  }
  login(params.value);
};

const handleLogin = () => {
  signPrivacy.value = true;
  agreeheckVisible.value = false;
  if (!authLogin.value) {
    login(params.value);
  }
};

const login = (params) => {
  console.log("params", params);
  // API 调用已移除 - setUserInfoForLogin
  // TODO: 需要实现登录逻辑
  proxy.$Tips.toast("登录功能暂不可用");
};

const loginAfter = () => {
  // #ifdef APP-PLUS
  // setNextPage(null)
  console.log("back 前页面栈：", getCurrentPages().map(p => p.route));
  proxy.$Router.back();
  setTimeout(() => {
    proxy.$Router.back();
  },80)
  console.log("back 后页面栈：", getCurrentPages().map(p => p.route));
  // #endif
  // #ifndef APP-PLUS
  if (nextPage.value) {
    const { query, path, params } = nextPage.value;
    setNextPage(null);
    proxy.$Router.replace(path, {
      ...params,
      query: query,
    });
  } else {
    proxy.$Router.back();
  }
  // #endif
};

watch(
  () => signPrivacy.value,
  (val) => {
    if (val && authLogin.value) {
      openType.value = "getPhoneNumber";
    } else {
      openType.value = "";
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.login {
  min-height: 100vh;
  .login-btn {
    width: 628rpx;
    height: 96rpx;
    border-radius: 50rpx;
  }
  .login-logo {
    .logo-image {
      width: 275rpx;
    }
  }
  .login-border {
    border-bottom: 2rpx solid var(--var_border_v8_color);
  }
  .login-line {
    width: 22rpx;
    height: 1rpx;
    background: #4b4b4b;
  }
  .login-otherLogin {
    bottom: 305rpx;
    left: 50%;
    transform: translateX(-50%);
  }
  .skip {
    top: 34rpx;
    right: 26rpx;
  }
  .btn-image {
    width: 54rpx;
    height: 54rpx;
  }
}
</style>
