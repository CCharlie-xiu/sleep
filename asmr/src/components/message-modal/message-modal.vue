<template>
	<view class="message-modal">
		<u-popup v-model="show" mode="center" :mask-close-able="maskCloseAble"
    :duration="show ? 100 : 50"
    >
      <view 
      class="u-flex container "
      :style="[containerStyle]"
      @click="handleMask">
        <view class="main u-rela u-flex-col u-row-center u-col-center" 
        @click.stop
        :style="[{backgroundImage: 'url(' + _img(bgPath) + ')'}, mainStyle]">
          <slot 
          name="contentFull">
            <slot name="contentTop"></slot>
            <slot name="contentMiddle">
              <view class="message theme-family u-font-42">
                {{message}}
              </view>
            </slot>
            <slot name="contentBottom"></slot>
          </slot>
          
          <view class="button u-flex "
          :style="[buttonBoxStyle]">
            <u-button
            v-if="showCancelBtn"
            :custom-style="btnStyle"
            ripple
            shape="circle"
            :loading="cancelLoading"
            :hair-line="false"
            @click="handleCancel">
              {{cancelBtnText}}
            </u-button>
            <u-button
            v-if="showConfirmBtn"
            :custom-style="{
              ...btnStyle,
              background: '#D68C51',
              color: '#fff',
              marginLeft: showCancelBtn ? '24rpx' : '',
              fontWeight: 'normal',
              fontFamily: 'AlibabaPuHuiTi-3-85-Bold',
              border: 'none',
              ...confirmBtnStyle
            }"
            ripple
            :hair-line="false"
            shape="circle"
            :loading="confirmLoading"
            @click="handleConfirm">
              {{confirmBtnText}}
            </u-button>
          </view>
          <view
          v-if="showCloseAble"
          :style="[closeBtnStyle]"
          @click="show = false"
          class="close-able">
          </view>
        </view>
        
      </view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		name: 'message-modal',
		props: {
			value: {
				type: Boolean,
				default: false
			},
      showCancelBtn: {
        type: Boolean,
				default: true
      },
      showConfirmBtn: {
        type: Boolean,
				default: true
      },
      cancelBtnText: {
        type: String,
				default: '取消'
      },
      confirmBtnText: {
        type: String,
				default: '确认'
      },
      maskCloseAble: {
        type: Boolean,
				default: true
      },
      asyncClose: {
        type: Boolean,
				default: false
      },
      showCloseAble: {
        type: Boolean,
				default: true
      },
      message: {
        type: String,
        default: ''
      },
      bgPath: {
        type: String,
        default: 'common/message-modal.png'
      },
      mainStyle: {
        type: Object,
        default: () => ({})
      },
      buttonBoxStyle: {
        type: Object,
        default: () => ({})
      },
      confirmBtnStyle: {
        type: Object,
        default: () => ({})
      },
      closeBtnStyle: {
        type: Object,
        default: () => ({})
      },
      containerStyle: {
        type: Object,
        default: () => ({})
      }
		},
		data() {
			return {
				show: this.value || false,
        confirmLoading: false,
        cancelLoading: false
			};
		},
    computed: {
      btnStyle(){
        return {
          border: '2rpx solid #BD6621',
          background: 'transparent',
          // flex: '1',
          width: '213rpx',
          height: '74rpx',
          color: '#A74C04',
          fontSize: '26rpx',
          fontWeight: 'bold',
          fontFamily: 'HarmonyOS_Sans_Black'
        }
      }
    },
		watch: {
			value(val) {
				this.show = val;
        if(val){
          this.confirmLoading = false;
          this.cancelLoading = false;
        }
			},
			show(val) {
				this.$emit('input', val);
				this.$emit('change', val);
			}
		},
    methods: {
      handleMask(){
        if(this.maskCloseAble){
          this.show = false;
        }
      },
      handleCancel(){
        if(this.asyncClose){
          this.cancelLoading = true;
        }else{
          this.show = false;
        }
        this.$emit('cancel');
      },
      handleConfirm(){
        if(this.asyncClose){
          this.confirmLoading = true;
        }else{
          // this.show = false;
        }
        this.$emit('confirm');
      }
    }
	};
</script>

<style lang="scss" scoped>
	.message-modal {
    .container{
      height: 100vh;
      .main {
        margin: auto;
        width: 555rpx;
        height: 352rpx;
        @include background-mixin();
        .message{
          margin-top: 60rpx;
        }
        .button{
          margin-top: 36rpx;
          width: 100%;
          // padding: 0 75rpx;
          padding-left: 68rpx;
        }
        .close-able{
          position: absolute;
          z-index: 1;
          right: 8rpx;
          top: -64rpx;
          width: 56rpx;
          height: 56rpx;
          transform: rotate(45deg);
          background: rgba(255,255,255,0.2);
          border-radius:  56rpx;
          border: 2rpx solid #fff;
          &::before, &::after{
            content: '';
            position: absolute;
            background: #fff;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          &::before{
            width: 28rpx;
            height: 2rpx;
          }
          &::after{
            width: 2rpx;
            height: 28rpx;
          }
        }
      }
    }
	}
</style>
