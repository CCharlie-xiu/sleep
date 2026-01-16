<template>
  <custom-popup
    v-model="visible"
    :open-direction="openDirection"
    bg-color="transparent"
    :overlay-opacity="0.5"
    :overlay-closeable="true"
    :showHeader="false"
  >
    <view class="choose-image bg-color-v16 pt-46 pb-18 px-38 mx-44">
      <slot name="top"></slot>
      <view
        class="choose-image-item bg-color-v17 tn-flex items-center mb-28 px-28 py-26"
        v-for="(item, index) in chooseList"
        @click="handleChooseImage(item.type)"
        hover-class="hover-class"
        :key="index"
      >
        <image class="icon mr-16" :src="item.iconSrc" mode="width" />
        <view class="font-size-30 font-weight-400 font-color-v24">{{
          item.name
        }}</view>
      </view>
    </view>
  </custom-popup>

  <chooseCreation v-model="showCreation" @handleSubmit="handleSubmit" />
</template>

<script setup>
import { ref } from "vue";
import { chooseMedia } from "@/common/utils/uniApi.js";
import chooseCreation from "./choose-creation.vue";
import throttle from "@/common/utils/throttle";

const { proxy } = getCurrentInstance();
const emit = defineEmits(["upload-success"]); // 定义事件

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  openDirection: {
    type: String,
    default: "bottom",
  },
});

const chooseList = ref([
  {
    id: 1,
    type: "album",
    name: "手机相册",
    iconSrc: `${proxy.$staticPath.play}/album-icon.png`,
  },
  {
    id: 2,
    type: "camera",
    name: "拍摄",
    iconSrc: `${proxy.$staticPath.play}/camera-icon.png`,
  },
  {
    id: 3,
    type: "creation",
    name: "从我的创作中选择",
    iconSrc: `${proxy.$staticPath.play}/file-icon.png`,
  },
]);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const tempImagePath = ref(""); // 存储临时路径
const showCreation = ref(false);

// 选择图片
const handleChooseImage = (sourceType) => {
  throttle(async () => {
    if (sourceType === "creation") {
      showCreation.value = true;
    } else {
      chooseMedia({
        count: 1,
        sourceType: sourceType ? [sourceType] : ["camera", "album"],
      })
        .then((res) => {
          if (process.env.UNI_PLATFORM === 'app') {
            console.log('App 基座版本：', plus.runtime.version); // 输出 4.52.0 之类
          }
          console.log("chooseMedia 返回结果 ===>", JSON.stringify(res))
          let path = null
          // #ifdef APP-PLUS
          path = res.tempFiles[0]?.path;
          // #endif
          // #ifndef APP-PLUS
          path = res.tempFiles[0]?.tempFilePath;
          // #endif
          if (path) {
            tempImagePath.value = path;
            emit("upload-success", {
              id: null,
              tempFilePath: path,
              // #ifdef APP-PLUS
              fileType: 'image',
              // #endif
              // #ifndef APP-PLUS
              fileType: res.tempFiles[0]?.fileType,
              // #endif
            });
          }
        })
        .catch(console.error);
    }
  }, 1000);
};

const handleSubmit = (val) => {
  emit("upload-success", val);
  console.log('handleSubmit',val)
  showCreation.value = false;
};
</script>
<style lang="scss" scoped>
.choose-image {
  border-radius: 50rpx;
  opacity: 0.95;
  &-item {
    border-radius: 18rpx;
    .icon {
      width: 30rpx;
      height: 24rpx;
    }
  }
}
</style>
