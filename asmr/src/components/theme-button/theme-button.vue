<template>
  <tn-button
    v-bind="$attrs"
    :plain="mode === 'plain'"
    bg-color="gradient__cool-6"
    :text-color="mode === 'plain' ? '' : '#000'"
    :custom-class="mode === 'plain' ? 'tn-indigo_text' : ''"
    @click="handleBtnClick"
  >
    <slot></slot>
  </tn-button>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: "backaground",
  },
});
const emit = defineEmits(["handleClick"]);
const handleBtnClick = () => {
  emit("handleClick");
};
</script>

<style lang="scss" scoped>
</style>