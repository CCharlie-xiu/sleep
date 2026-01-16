<template>
  <view :style="[{ height: 670 + 'rpx' }]" class="box">
    <view class="swiper-container"
        @touchstart="touchStart"
        @touchend="touchEnd"
    >
      <!-- 
       :style="{
          filter: styleList[index].filter,
          transform: styleList[index].transform,
          zIndex: styleList[index].zIndex,
          opacity: styleList[index].opacity || 1,
          display: styleList[index].display,
        }"
       -->
      <view
        class="swiper-item"
        v-for="(item, index) in list"
        :key="index"
    
        v-show="Math.abs(current - index) < 3"
        :class="{
          active: current === index,
          left1: current -1 === index,
          left2: current -2 === index,
          right1: current + 1 === index,
          right2: current + 2 === index,
        }"
      >
        <view class="wrap center-img">
          <block v-if="!index">
            <view v-if="!current" 
          @click="chooseImage"
          class="choose-card u-flex"
          :style="[{
            backgroundImage: `url(${_img('upload/choose-card.png')})`,
          }]">
            <view
              class="choose-card-content u-flex-col u-col-center">
              <image 
              v-if="uploadCard.icon"
                class="icon"
                :style="[{
                  width: uploadCard.icon === 'upload-err' ? '175rpx' : '154rpx',
                  height: uploadCard.icon === 'upload-err' ? '163rpx' : '172rpx',
                }]"
              :src="_img('upload/'+ uploadCard.icon +'.png')"></image>
              <zui-progress-circle
              v-if="uploadCard.progress"
              :size="progeressSize"
              texture="#CD732C"
              bgTexture="#ececec"
              :position="uploadCard.progress"
              :range="[270, 630]"
              :ringWidth="progeressRingWidth"
              >
                <view class="u-progress-content u-font-28 font-weight-b">
                  <text class='u-progress-info'>{{uploadCard.progress}}%</text>
                </view>
              </zui-progress-circle>
              <!-- <u-circle-progress 
              width="120"
              bg-color="transparent"
              border-width="8"
              duration="300"
              active-color="#CD732C" :percent="50">
                <view class="u-progress-content u-font-28 font-weight-b">
                  <text class='u-progress-info'>{{uploadCard.progress}}%</text>
                </view>
              </u-circle-progress> -->
              <text
              class="tip u-font-28"
              :style="[{marginTop: uploadCard.tipTop}]">{{uploadCard.tip}}</text>
              <view
              v-if="uploadCard.btn"
              class="btn u-font-24">{{uploadCard.btn}}</view>
            </view>
          </view>
          <view v-else class="indexActive"></view>
          </block>
          <image v-else class="image" :src="item.picUrl" mode="widthFix" ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    /**
     * 图片url列表
     */
    list: {
      type: Array,
      default: [],
    },
    uploadCard: {
      type: Object,
      default: () => ({}),
    },
    initCurrent: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      /**
       * 开始触摸点坐标
       */
      start: {
        x: 0,
        y: 0,
      },
      /**
       * 每个item样式列表
       */
      styleList: [],
      height: 0,
      current: 0,
      progeressSize: uni.upx2px(110),
      progeressRingWidth: uni.upx2px(9),
      nowDisabled: false
    };
  },
  computed: {
    allDisabled(){
      return this.disabled || this.nowDisabled
    }
  },
  watch: {
    initCurrent() {
      this.changeCurrent();
    },
    list: {
      immediate: true,
      deep: true,
      handler() {
        this.styleList = [];
        this.list.forEach((item, index) => {
          this.styleList.push(this.addStyle(index));
        });
      },
    },
    current(val){
      this.$emit('update:initCurrent', val)
    }
  },
  mounted() {
    //防止页面翻页抖动
    // setTimeout(() => {
    //       const query = uni.createSelectorQuery().in(this);
    //       query.select('.image').boundingClientRect(data => {
    //         this.height = data.height
    //       }).exec();
    //     }, 1500)
    this.changeCurrent();
  },
  methods: {
    changeCurrent() {
      if(this.allDisabled) return;
      setTimeout(async () => {
        const value = this.initCurrent;
        if (value !== this.current) {
          this.nowDisabled = true;
          const isNext = value - this.current > 0;
          // const styleList = JSON.parse(JSON.stringify(this.styleList));
          const diff = Math.abs(value - this.current);
          const fun =  isNext ? this.next : this.prev;
          for(let i = 0; i < diff; i++){
            await new Promise(resolve => {
              setTimeout(() => {
                fun()
                resolve();
              }, 50);
            })
          }
          this.nowDisabled = false;
          // this.changeCurrent();
          // const len = Math.abs(value - this.current);
          // for(let i = 0; i< len; i++){
          //   const styleList = JSON.parse(JSON.stringify(this.styleList));
          //   this.styleList = isNext ? this.next(styleList) : this.prev(styleList);
          // }
        }
      }, 100);
    },
    chooseImage() {
      this.$emit("chooseImage");
    },
    imageTap(item) {
      // 图片的点击事件
      this.$emit("image-tap", item);
    },
    /**
     * 计算每个item样式
     * @param {Object} idx
     */
    addStyle(idx) {
      const len = this.list.length;
      if (idx > len / 2) {
        //这里是数组后一半的item放在左边,平移位置由远到近，例如共6个，后2个处理在这里
        var left = len - idx;
        return {
          transform:
            "scale(" + (1 - left / 6) + ") translate(-" + left * 25 + "%,0px)",
          zIndex: 99 - left,
          filter: `blur(${left == 0 ? 0 : 5}px)`, //滤镜
          //  display: idx == len - 1 ? "block" : "none",
          display: idx > 1 ? "block" : "none",
          idx,
        };
      } else {
        //这里是数组前一半item放在右边，平移位置由近到远，例如共6个，前4个处理在这里，这里第一个元素始终放在中间位置
        return {
          transform:
            "scale(" + (1 - idx / 6) + ") translate(" + idx * 25 + "%,0px)",
          zIndex: 99 - idx,
          filter: `blur(${idx == 0 ? 0 : 5}px)`, //滤镜
          display: idx > 2 ? "none" : "block",
          idx,
        };
      }
    },
    /**
     * 触摸开始
     * @param {Object} e
     */
    touchStart(e) {
      this.start.x = e.changedTouches[0] ? e.changedTouches[0].pageX : 0;
      this.start.y = e.changedTouches[0] ? e.changedTouches[0].pageY : 0;
    },
    /**
     * 触摸结束
     * @param {Object} e
     */
    touchEnd(e) {
      // let newStyleList = JSON.parse(JSON.stringify(this.styleList));
      if(this.allDisabled) return;
      let tx = e.changedTouches[0].pageX - this.start.x;
      let ty = e.changedTouches[0].pageY - this.start.y;
      if (Math.abs(tx) > Math.abs(ty)) {
        //左右方向滑动
        if (tx < 0) {
          // 向左滑动
          // const len = newStyleList.length;
          // const lastItem = newStyleList[newStyleList.length -1];
          // if(lastItem.idx){
          //   this.current++;
          //   const last = [newStyleList.pop()];
          //   newStyleList = last.concat(newStyleList);
          // }
          this.next();
        } else if (tx > 0) {
          // 向右滑动
          this.prev();
          // newStyleList.push(newStyleList[0]);
          // newStyleList.splice(0, 1);
          // this.current--;
        }
      } else {
        //这里就不处理上下方向的事件了，有此需求的同仁可以在这里写逻辑
        //上下方向滑动
        if (ty < 0) {
          // 向上滑动
        } else if (ty > 0) {
          // 向下滑动
        }
      }
      // this.styleList = newStyleList;
    },
    next(styleList) {
      // const lastItem = styleList[styleList.length -1];
      // if(lastItem.idx){
      //   this.current++;
      //   const last = [styleList.pop()];
      //   styleList = last.concat(styleList);
      // }
      // console.debug('last #debug =======>', lastItem);
      if (this.current + 1 < this.list.length) {
        this.current++;
      }
      // return styleList
    },
    prev(styleList) {
      // styleList.push(styleList[0]);
      // styleList.splice(0, 1);
      if (this.current - 1 > -1) {
        this.current--;
      }
      // return styleList
    },
  },
};
</script>

<style scoped lang="scss">
.box {
  .swiper-container {
    box-sizing: border-box;
    width: 100%;
    position: relative;
    .swiper-item:first-child{
      .wrap{
        overflow-y: hidden;
        overflow-x: auto;
        border-radius: 0;
        z-index: 1;
      }
    }
    .swiper-item {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transition: all 0.5s;
      &.active {
        transform: translateX(0);
        z-index: 89;
      }
      &.left1,
      &.left2,
      &.right1,
      &.right2 {
        // filter: blur(5px); //滤镜
      }
      &.left1 {
        transform: scale(0.875) translate(-20%, 0px);
        z-index: 88;
      }
      &.left2 {
        transform: scale(0.75) translate(-40%, 0px);
        z-index: 87;
      }
      &.right1 {
        transform: scale(0.875) translate(20%, 0px);
        z-index: 88;
      }
      &.right2 {
        transform: scale(0.75) translate(40%, 0px);
        z-index: 87;
      }
      
      .wrap {
        padding: 2rpx 0rpx;
        width: 408rpx;
        height: 670rpx;
        overflow: hidden;
        position: relative;
        z-index: 0;
        margin: 0 auto;
        border-radius: 64rpx;
        .choose-card {
          @include background-mixin();
          // pointer-events: none;
          width: 100%;
          height: 668rpx;
          &-content {
            margin: auto;
            .icon {
              width: 154rpx;
              height: 172rpx;
            }
            .tip {
              margin-top: 46rpx;
              color: $color-666666;
            }
            .btn {
              border: 2rpx solid #b9763c;
              background: #ffebd4;
              border-radius: 40rpx;
              padding: 14rpx 40rpx;
              margin-top: 30rpx;
            }
          }
          .u-progress-content{
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate3d(-50%, -50%, 0);
          }
        }
        .image {
          width: 100%;
          height: 100%;
          // height: 670rpx;
          border-radius: 64rpx;
          position: relative;
          z-index: -1;
        }
      }
    }
  }
}
.indexActive {
  width: 100%;
  height: 668rpx;
  border-radius: 21rpx;
  background-color: #fffaee;
  border: 2rpx dashed #a09282;
}
</style>

