<template>
	<view class="navbar nav-bg" 
	:style="[{backgroundColor: bgColor, backgroundImage: `url(${bgImg})`, backgroundSize: bgSize}]"
		>
		<!-- :style="[{ height: `${navBarH + (isDefNav? 0:statusBarH)}px`}]" -->
		<!-- 状态栏 -->
		<view :style="[{height:`${(isDefNav? 0: statusBarH)}px`}]"></view>
		<view class="navbar__title u-flex-col  u-font-24 u-row-center" :style="[{
			height:`${navBarH}px`,
		}
		<!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
		, { width: `${menuLeft}px`}
		<!-- #endif -->
		]">
		<slot name="title">
		  <image v-show="!title" class="logo" mode="aspectFit" :src="_img('navbar/navbar-logo.png')"></image>
			<view :style="[titleStyle]">
      	{{title || 'AI技术实现人人做舞蹈家的梦'}}
    	</view>
		</slot>
    </view>
	</view>
</template>

<script>
	import { isMpDt } from '@/common/data/staticData.js'
	export default {
		props: {
			// 版位数据 首页 介绍版位
			positionData: {
				type: Object,
				default: () => ({})
			},
			bgColor: {
				type: String,
				default: '#FFFFFF00'
			},
			title: {
				type: String,
				default: ''
			},
			titleStyle: {
				type: Object,
				default: () => ({})
			},
			bgImg: {
				type: String,
				default: ''
			},
			bgSize: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				paddingLeft: '',
				appName: '',
				statusBarH: 20,
				navBarH: 40,
				windowWidth: 375,
				contPand: 0,
				// #ifdef MP-WEIXIN || MP-TOUTIAO || MP-KUAISHOU
				menuLeft: 280,
				// #endif
				// #ifdef MP-ALIPAY || MP-TOUTIAO
				isDefNav: isMpDt,
				isMpDt,
				// #ifdef MP-TOUTIAO
				paddingLeft: '100rpx'
				// #endif
				// #ifdef MP-ALIPAY
				paddingLeft: '80rpx'
				// #endif
				// #endif
				// #ifndef MP-ALIPAY || MP-TOUTIAO
				isDefNav: false,
				// #endif
				// #ifdef H5
				isMpDt: null
				// #endif
			};
		},
		computed: {
		},
		mounted() {
			this.appName = this.$appName;
			this.statusBarH = this.$statusBarHeight;
			// cont元素的上下padding+2
			this.contPand = uni.upx2px(10);
			this.navBarH = this.$navBarHeight;
			// #ifdef MP-WEIXIN || MP-TOUTIAO || MP-KUAISHOU
			this.menuLeft = this.$menuBtnLeft;
			// #endif
			this.windowWidth = this.$windowWidth;
			// console.debug('mll', this.navBarH);
		},
		methods: {
			handleJump(){
				this.$root.clickBanner(this.positionData)
			},
			open() {
				this.$Router.push({
					name: 'search'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  z-index: 99;
	width: 100%;
  .logo{
    width: 128rpx;
    height: 46rpx;
    margin-bottom: 4rpx;
  }
	&__title{
		// #ifdef H5
		justify-content: center;
		// #endif
		// #ifdef MP
		padding-left: 30rpx;
		// #endif
		background: linear-gradient();

	}
	&__cont {
		padding: 4rpx 20rpx;
		padding-bottom: 16rpx;
		&__box {
			align-self: flex-end;
			padding: 16rpx 20rpx;
			border-radius: 40rpx;
			flex: 1;
			// width: 400rpx;
			font-size: 26rpx;
		}
	}
}
</style>
