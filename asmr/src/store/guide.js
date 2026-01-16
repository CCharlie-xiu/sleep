// 引导页
import { defineStore } from "pinia";
import { getStorageSync, setStorageSync } from "@/common/utils/storage";
import { JUDGE_IS_FIRST_LAUNCH } from "@/common/data/constants"

export default defineStore("guide", () => {
  let showGuide = ref(!getStorageSync(JUDGE_IS_FIRST_LAUNCH));
  // 相当于actions
  const closeGuide = () => {
    showGuide.value = false
    setStorageSync(JUDGE_IS_FIRST_LAUNCH, 1)
  }

  let showRewardPoint = ref(true)

  const updataShowReward = (val) => {
    showRewardPoint.value = val
  }
  return {
    showGuide,
    showRewardPoint,
    closeGuide,
    updataShowReward
  }
});