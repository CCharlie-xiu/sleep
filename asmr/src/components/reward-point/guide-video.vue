<template>
  <tn-popup
    v-model="visible"
    open-direction="center"
    :overlay-closeable="true"
    bg-color="transparent"
    @close="handleClose"
    close-btn
  >
    <view class="tn-flex-center-center tn-flex-column"
      v-if="visible"
    >
      <video
        class="videoType"
        :src="fileEntity?.accessUrl"
        object-fit="cover"
        autoplay
        loop
        :style="{
          width: videoWidth + 'px',
          height: videoHeight + 'px',
        }"
        :show-fullscreen-btn="false"
        :show-background-playback-button="false"
        @loadedmetadata="loadedmetadata"
      ></video>
      <image
        class="guide-img mt-40"
        hover-class="hover-class"
        @click="handleClick"
        mode="widthFix"
        :src="guideBtnIcon?.imageFileEntity?.accessUrl"
      ></image>
    </view>
  </tn-popup>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
// API 调用已移除 - getMaterialByCode, listPageElement
import usePositionJump from "@/hooks/usePostionJump";
const { proxy } = getCurrentInstance();
const { handleJump } = usePositionJump();
const emit = defineEmits(["update:modelValue"]);
const videoWidth = uni.upx2px(558);
const videoHeight = ref(0); // 添加响应式高度变量

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const fileEntity = ref({});
const guideBtnIcon = ref([]);
const init = () => {
  getMaterialByCode("newUserGuideVideo")
    .then((res) => {
      const record = res.data.getMaterialByCode.record;
      fileEntity.value = record.fileEntity;
    })
    .catch((err) => {});
};
const getBanner = () => {
  listPageElement(1, 50, {
    pageCode: "index",
    elementCode: "newUserGuide",
  }).then((res) => {
    const list = res.data.listPageElementSearch.records;
    guideBtnIcon.value = list[0];
  });
};

const loadedmetadata = (e) => {
  const { height, width } = e.detail;
  const aspectRatio = height / width;
  videoHeight.value = videoWidth * aspectRatio;
};

const handleClick = () => {
  visible.value = false;
  handleJump(guideBtnIcon.value);
};

const handleClose = () => {
  visible.value = false;
};

onMounted(() => {
  init();
  getBanner();
});
</script>

<style lang="scss" scoped>
.videoType {
  border: 4rpx solid var(--var_border_v12_color);
  border-radius: 16rpx;
}
.guide-img {
  width: 434rpx;
}
</style>