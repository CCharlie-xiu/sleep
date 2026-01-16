<template>
  <view class="cum_container">
    <view
      class="navbar-box"
      :class="boxClass"
      :style="[
        {
          transition: transition,
          background: bgColor,
          'z-index': zIndex ? zIndex : '',
          position: fixed ? 'fixed' : 'static',
        },
      ]"
    >
      <!-- 状态栏 -->
      <view :style="[{ 'min-height': statusBarHeight + 'px' }]"></view>
      <view
        :style="[{ 'min-height': navBarHeight + 'px' }]"
        class="nav-container"
      >
        <!-- #ifndef MP-TOUTIAO -->
        <slot name="back">
          <view
            v-if="left && (back || close)"
            class="nav-box"
            hover-class="hover-class"
            @click.stop="backPage"
            @touchstart.stop="backPage"
            @touchmove.stop
            @touchend.stop
          >
            <image
              :src="
                '/static/common/' +
                $themeName +
                '/' +
                [close ? 'close.png' : reverse ? 'back-w.png' : 'back.png']
              "
              mode="scaleToFill"
            ></image>
          </view>
        </slot>
        <!-- #endif -->

        <view class="nav-all" :class="[{ left: leftAll, right: rightAll }]">
          <slot name="all"></slot>
        </view>
        <!-- #ifndef MP-TOUTIAO -->
        <view
          v-if="right && (back || close)"
          class="nav-box"
          @click.stop="backPage"
          @touchstart.stop
          @touchmove.stop
          @touchend.stop
        >
          <image
            :src="
              '/static/navbar/' +
              [close ? 'close.png' : reverse ? 'back-w.png' : 'back.png']
            "
            mode="scaleToFill"
          ></image>
        </view>
        <!-- #endif -->
        <view class="nav-content" :class="{ reverse: reverse }">
          <slot name="default"></slot>
          <view class="title font-color-v3 font-size-30" v-if="showTitle && !$slots.default">
              {{navTitle}}
            </view>
        </view>
      </view>
    </view>
    <view
      v-if="fixed"
      :style="[{ 'min-height': statusBarHeight + navBarHeight + 'px' }]"
    ></view>
  </view>
</template>

<script setup>
const props = defineProps({
  bgColor: {
    type: String,
    default: "#ffffff00",
  },
  close: {
    type: Boolean,
    default: false,
  },
  back: {
    type: Boolean,
    default: true,
  },
  right: {
    type: Boolean,
    default: false,
  },
  left: {
    type: Boolean,
    default: true,
  },
  rightAll: {
    type: Boolean,
    default: false,
  },
  leftAll: {
    type: Boolean,
    default: false,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
  status_reverse: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: [String, Number],
    default: 0,
  },
  fixed: {
    type: Boolean,
    default: true,
  },
  transition: {
    type: String,
    default: "",
  },
  boxClass: {
    type: Array,
    default: () => [],
  },
  isBackCall: {
    type: Boolean,
    default: false,
  },
  showTitle: {
    type: Boolean,
    // #ifdef MP-TOUTIAO
    default: false,
    // #endif
    // #ifndef MP-TOUTIAO
    default: true,
    // #endif
  },
  title: {
    type: String,
    default: "",
  },
  isApp: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["backCallback"]);
const { proxy } = getCurrentInstance();
const statusBarHeight = ref(0);
const navBarHeight = ref(48);
const windowWidth = ref(375);
const navTitle = ref('')

watch(
  () => props.status_reverse,
  (val) => {
    this.changeNavigationBarColor();
  }
);

const backPage = () => {
  try {
    if (props.isBackCall) {
      emit("backCallback");
    } else {
      if (getCurrentPages().length > 1) {
        proxy.$Router.back();
      } else {
        proxy.$Router.replaceAll("/pages/index/index");
      }
    }
  } catch (error) {
    proxy.$Router.replaceAll("/pages/index/index");
  }
};
const changeNavigationBarColor = () => {
  uni.setNavigationBarColor({
    // #ifndef MP-ALIPAY
    frontColor: props.status_reverse ? "#ffffff" : "#000000",
    // #endif
    backgroundColor: props.bgColor == "transparent" ? "#ffffff" : props.bgColor,
  });
};

const changeTitle = (title) => {
  navTitle.value = title;
}

onMounted(() => {
  statusBarHeight.value = proxy.$statusBarHeight;
  navBarHeight.value = proxy.$navBarHeight;
  // 手机app去除nav高度
  if(props.isApp){
    navBarHeight.value = 0
  }
  windowWidth.value = proxy.$windowWidth;
  if(props.showTitle){
    const routerParam = proxy.$Router.getRouterParams();
    navTitle.value = props.title || routerParam.query && routerParam.query.t || '';
    if(navTitle.value){
      navTitle.value = decodeURIComponent(navTitle.value);
    }
  }
  // changeNavigationBarColor();
});

defineExpose({
  changeTitle
})
</script>

<style lang="scss" scoped>
.cum_container {
  width: 100%;

  .navbar-box {
    width: 100%;
    background-color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;

    .nav-container {
      display: flex;
      align-items: center;
      justify-content: center;

      image {
        width: 16rpx;
        height: 36rpx;
        vertical-align: middle;
      }

      .nav-content {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 36rpx;
        color: #333;
        /* #ifdef APP-PLUS || H5 */
        width: 100%;
        /* #endif */

        &.reverse {
          color: #fff;
        }
        .title{
          width: 600rpx;
        }

        // font-weight: bold;
      }

      .nav-box {
        // border: 1px solid red;
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        // flex-shrink: 0;
      }

      .nav-all {
        // border: 1px solid red;
        margin: 0 30rpx;
        flex: 1;

        &.left {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        &.right {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
        }
      }
    }
  }
}
</style>
