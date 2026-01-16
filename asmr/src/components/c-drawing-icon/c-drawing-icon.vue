<script setup>
import { watch, onMounted } from "vue";
import { useDrawingStore } from "@/store/drawing"
const drawingStore = useDrawingStore()
const { drawing } = storeToRefs(drawingStore)

</script>

<template>
  <!-- #ifdef APP-PLUS || MP-KUAISHOU -->
  <view class="icon madeUp" hover-class="hover-class" @click="$Router.push('/minePages/create-record/create-record')">
    <image class="w-100 h-100" :src="`${$staticPath.index}/drawing.png`" mode="width" />
  </view>
  <!-- #endif -->
  <!-- #ifndef APP-PLUS || MP-KUAISHOU-->
  <view class="icon madeUp" hover-class="hover-class" @click="$Router.push('/minePages/create-record/create-record')">
    <image class="w-100 h-100" :src="`${$staticPath.index}/drawing.${drawing ? 'gif' : 'png'}`" mode="width" />
  </view>
  <!-- #endif -->
</template>

<style>
.madeUp {
  width:41rpx;
  height:40rpx;
}
</style>