<template>
  <view class="search-box tn-flex items-center px-36 rela" :style="[searchStyle]"
  @click="handleClick">
    <view
    <!-- #ifdef APP-PLUS -->
     class="search items-center tn-flex pl-20 pr-8 bg-color-v3"
    <!-- #endif -->
     <!-- #ifndef APP-PLUS -->
      class="search items-center tn-flex px-20 bg-color-v3"
     <!-- #endif -->
      :style="[customStyle]"
      :class="customClass"
    >
      <slot name="prefix">
        <tn-icon
          name="search"
          :color="
            searchValue
              ? inactiveIconColor || proxy.$themeConfig.var_icon_v5_color
              : $themeConfig.var_icon_v12_color
          "
          size="30"
        >
        </tn-icon>
      </slot>
      <input
        class="input ml-14 font-size-30 font-color-v8 tn-flex-1"
        :style="[inputStyle]"
        :disabled="readonly"
        :placeholder-style="placeholderStyle || `color: ${$themeConfig.var_font_v8_color}`"
        type="text"
        :placeholder="placeholder"
        :focus="focus"
        @blur="handleBlur"
        @focus="handleFocus"
        v-model="searchValue"
        @input="handleSearchInput"
        @confirm="handleSearch"
      />
      <tn-icon
        class="mx-10"
        v-if="clearable"
        v-show="searchValue !== ''"
        name="close-fill"
        :color="$themeConfig.var_icon_v13_color"
        size="32"
        @click="handleClearSearch"
      ></tn-icon>
      <slot name="suffix"></slot>
    </view>
    <view
      v-if="showSubmit"
      class="operator ml-28 font-size-30 font-color-v3"
      hover-class="hover-class"
      @click="handleSearch"
    >
      {{ searchValue ? "搜索" : "取消" }}
    </view>
    <slot name="append"></slot>
    <view class="abso mask" v-if="readonly">

    </view>
  </view>
</template>

<script setup>
import Debounce from "@/common/utils/debounce";
import { trim } from "@/common/utils/util";
const debounce = new Debounce();
const { proxy } = getCurrentInstance();
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  focus: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  showSubmit: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: "请输入搜索内容",
  },
  searchStyle: {
    type: Object,
    default: () => ({}),
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  customClass: {
    type: [Object, String, Array],
    default: "",
  },
  inputStyle: {
    type: Object,
    default: () => ({}),
  },
  placeholderStyle: {
    type: String,
    default: '',
  },
  inactiveIconColor: {
    type: String,
    default: "",
  },
  readonly: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits([
  "update:modelValue",
  "update:focus",
  "change",
  "submit",
  "clear",
  "blur",
  "focus",
  'handleClick'
]);
const searchValue = ref("");

watch(
  () => props.modelValue,
  (newValue) => {
    searchValue.value = newValue;
  }
);
watch(
  () => searchValue.value,
  (newValue) => {
    emit("update:modelValue", trim(newValue));
  }
);

const handleSearchInput = (e) => {
  debounce.start(() => {
    emit("change", trim(e.detail.value));
  }, 200);
};

const handleBlur = (e) => {
  emit("update:focus", false);
  emit("blur");
};
const handleFocus = (e) => {
  emit("update:focus", true);
  emit("focus");
};
const handleClearSearch = () => {
  searchValue.value = "";
  emit("clear");
};

const handleSearch = () => {
  emit("submit", searchValue.value);
};
const handleClick = () => {
  emit("handleClick");
}
</script>

<style lang="scss" scoped>
.search-box{
  .mask{
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
  }
}
</style>
