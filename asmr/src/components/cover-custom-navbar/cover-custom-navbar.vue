<template>
		<cover-view class="navbar-box" :class="boxClass"
			:style="[{'transition':transition,'background':bgColor,'z-index':zIndex?zIndex:'','position':fixed?'fixed':'static'}]">
			<!-- 状态栏 -->
			<cover-view :style="[{'min-height':statusBarHeight + 'px'}]"></cover-view>
			<cover-view :style="[{'min-height':navBarHeight+'px'}]" class="nav-container">
				<!-- #ifndef MP-TOUTIAO -->
				<cover-view v-if="left && (back || close)" class="nav-box" @click.stop="backPage">
					<cover-image :src="_img('navbar/' + [close?'close.png': (reverse ? 'back-w.png':'back.png')])"
						mode="scaleToFill"></cover-image>
				</cover-view>
				<!-- #endif -->

				<cover-view class="nav-all" :class="[{'left':leftAll,'right':rightAll}]">
					<slot name="all"></slot>
				</cover-view>
				<!-- #ifndef MP-TOUTIAO -->
				<cover-view v-if="right && (back || close)" class="nav-box" @click.stop="backPage">
					<cover-image :src="_img('navbar/' + [close?'close.png':(reverse ? 'back-w.png':'back.png')])"
						mode="scaleToFill"></cover-image>
				</cover-view>
				<!-- #endif -->
				<cover-view class="nav-content" :class="{'reverse':reverse}">
					{{title}}
				</cover-view>
			</cover-view>
		</cover-view>
		<!-- <cover-view v-if="fixed" :style="[{'min-height':(statusBarHeight+navBarHeight) + 'px'}]"></cover-view> -->
</template>

<script>
	export default {
		name: 'custom-navbar',
		props: {
			bgColor: {
				type: String,
				default: '#FFFFFF00'
			},
			close: {
				type: Boolean,
				default: false
			},
			back: {
				type: Boolean,
				default: true
			},
			right: {
				type: Boolean,
				default: false
			},
			left: {
				type: Boolean,
				default: true
			},
			rightAll: {
				type: Boolean,
				default: false
			},
			leftAll: {
				type: Boolean,
				default: false
			},
			reverse: {
				type: Boolean,
				default: false
			},
			status_reverse: {
				type: Boolean,
				default: false
			},
			zIndex: {
				type: String | Number,
				default: 0
			},
			fixed: {
				type: Boolean,
				default: true
			},
			transition: {
				type: String,
				default: ''
			},
			boxClass: {
				type: Array,
				default: () => []
			},
			hSize: {
				type: String,
				default: '100% 70vh'
			},
			title: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				navBarHeight: 48,
				windowWidth: 375,
			};
		},
		watch: {
			status_reverse(val) {
				this.changeNavigationBarColor();
			}
		},
		mounted() {
			this.statusBarHeight = this.$statusBarHeight;
			this.navBarHeight = this.$navBarHeight;
			this.windowWidth = this.$windowWidth;
			this.changeNavigationBarColor();
			// if(this.status_reverse){
			// 	uni.setNavigationBarColor({
			// 		frontColor:"#ffffff",
			// 		backgroundColor:this.bgColor
			// 	})
			// }else{
			// 	uni.setNavigationBarColor({
			// 		frontColor:"#000000",
			// 		backgroundColor:this.bgColor
			// 	})
			// }
		},
		methods: {
			backPage() {
				if (this.$Route.query.isShare) {
					this.$Router.replaceAll({
						name: 'index'
					});
				} else {
					// #ifdef MP-KUAISHOU
					ks.navigateBack({
						delta: 1
					});
					// #endif
					// #ifndef MP-KUAISHOU
					this.$Router.back(1);
					// #endif
				}
			},
			changeNavigationBarColor() {
				uni.setNavigationBarColor({
					// #ifndef MP-ALIPAY
					frontColor: this.status_reverse ? '#ffffff' : '#000000',
					// #endif
					backgroundColor: this.bgColor == 'transparent' ? '#ffffff' : this.bgColor
				});
			}
		},
	};
</script>

<style lang="scss" scoped>
	.cum_container {
		width: 100%;

	}
	.navbar-box {
		width: 100%;
		background-color: $color-ffffff;
		position: fixed;
		top: 0;
		z-index: 9999;

		.nav-container {
			display: flex;
			align-items: center;
			justify-content: center;

			cover-image {
				width: 44rpx;
				height: 44rpx;
				vertical-align: middle;
			}

			.nav-content {
				position: absolute;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;
				color: #131414;
				font-weight: bold;

				&.reverse {
					color: $color-ffffff;
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
			}

			.nav-all {
				// border: 1px solid red;
				margin: 0 32rpx;
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
</style>
