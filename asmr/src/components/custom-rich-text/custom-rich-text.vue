<template>
  <view :class="contaiClass">
    <rich-text :class="classNames" :nodes="nodes"> </rich-text>
  </view>
</template>

<script>
import parse from "mini-html-parser2";
export default {
  name: "custom-rich-text",
  props: {
    // 容器class
    contaiClass: {
      type: String,
      default: "u-text-center",
    },
    // 富文本组件class
    classNames: {
      type: String,
      default: "",
    },
    // 富文本内容
    proCont: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      nodes: [],
    };
  },
  watch: {
    proCont: {
      handler(val) {
        if (val) {
          const imgData = val
            .replace(/\<img/g, '<img style="max-width: 100%;vertical-align: middle;" class="rich-img"')
            .replace(/(src=["'])\/\//g, "$1https://")
            .replace(/pre>/g, "p>");
          let strhtml = imgData.replace(/\<br>/g, "<br></br>");
          strhtml = `<div class="rich-text-detail-box">${strhtml}</div>`;
          parse(strhtml, (err, nodes) => {
            if (!err) {
              this.nodes = nodes;
            }
          });
        }
      },
      immediate: true,
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
</style>
