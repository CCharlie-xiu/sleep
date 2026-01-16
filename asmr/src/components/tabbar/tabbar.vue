<template>
  <view 
  class="custom-tabbar u-flex">
    <view 
    class="bg u-abso"></view>
    <view class="custom-tabbar-container u-flex-1 u-flex u-col-bottom u-rela">
      <view class="custom-tabbar-item u-flex-1 u-flex-col u-col-center"
      v-for="tab in tabList"
      :key="tab.name"
      :class="{ active: currentTab === tab.name }"
      @click="changeTab(tab.name)">
        <image 
          class="custom-tabbar-item-icon"
          :style="[...tab.iconStyle]"
          :src="_img(`tabbar/${tab.icon + (currentTab === tab.name ? '-active' : '')}.png`)"
        mode="aspectFit"></image>
        <text class="custom-tabbar-item-text">
          {{tab.title}}
        </text>
      </view>
    </view>
    <template v-if="isPreLoad">
      <view class="custom-tabbar-preload u-flex-1 u-flex-col u-col-center u-abso"
        v-for="tab in tabList"
        :key="tab.name">
          <image 
            class="custom-tabbar-item-icon"
            :src="_img(`tabbar/${tab.icon}.png`)"
          ></image>
          <image 
            class="custom-tabbar-item-icon"
            :src="_img(`tabbar/${tab.icon}-active.png`)"
          ></image>
        </view>
    </template>
  </view>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: 'index'
    }
  },
  data(){
    return {
      tabList: [
        {
          name: 'index',
          path: '/pages/index/index',
          icon: 'home',
          iconStyle: {
            // width: '124rpx',
            // height: '134rpx'
            width: '80rpx',
            height: '86rpx'
          },
          title: '首页'
        },
        // {
        //   name: 'upload',
        //   path: '/pages/upload/upload',
        //   icon: 'diy',
        //   iconStyle: {
        //     // width: '126rpx',
        //     // height: '140rpx'
        //     width: '80rpx',
        //     height: '86rpx'
        //   },
        //   title: '上传照片'
        // },
        {
          name: 'mine',
          path: '/pages/mine/mine',
          icon: 'mine',
          iconStyle: {
            // width: '106rpx',
            // height: '138rpx'
            width: '80rpx',
            height: '86rpx'
          },
          title: '我的'
        }
      ],
      currentTab: this.value || 'index',
      isPreLoad: true,
    }
  },
  watch: {
    value(val){
      this.currentTab = val;
    },
    currentTab(val){
      this.$emit('input', val);
    }
  },
  mounted(){
    setTimeout(() => {
      this.isPreLoad = false;
    }, 500);
  },
  methods: {
    changeTab(name){
      this.$u.throttle(() => {
        if(name !== this.currentTab){
          this.$emit('change', name);
          this.currentTab = name;
        }  
      }, 100, false)
    }
  }
}
</script>
<style lang="scss" scoped>
.custom-tabbar{
  position: fixed;
  bottom: 0;
  width: 750rpx;
  z-index: 99;
  font-weight: 400;
  // font-weight: bold;
  // max-height: 124rpx;
  font-family: $theme-family;
  // font-size: 32rpx;
  font-size: 28rpx;

  .bg{
    background-color: #FFFBF2;
    bottom: 0;
    width: 100%;
    // height: calc(148rpx + var(--padding-bottom, 10rpx));
    height: calc(128rpx + var(--padding-bottom, 10rpx));

    // @include tabbar-page-bottom();

  }
  &-container{
    padding-bottom: var(--padding-bottom, 10rpx);
  }
  &-item{
    // padding-bottom: constant(safe-area-inset-bottom, $page-padding-bottom);
	  // padding-bottom: env(safe-area-inset-bottom, $page-padding-bottom);
    &-text{
      // margin-top: 2rpx;
    }
    &-icon{
      vertical-align: middle;
    }
  }
  &-preload{
    left: 9999px;
    top: 9999px;
  }
}
</style>