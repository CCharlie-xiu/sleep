<template>
  <!-- #ifndef MP -->
  <view :class="W_CONTAINER" :bus="renderOptions" :change:bus="render.layout">
    <slot></slot>
  </view>
  <!-- #endif -->
  <!-- #ifdef MP -->
  <view :class="W_CONTAINER" :id="W_CONTAINER">
    <slot></slot>
  </view>
  <!-- #endif -->
</template>

<script>
import { throttle, querySelector, sleep } from "./utils/utils";
import { W_CONTAINER, W_ITEM, CONTAINER, RESIZE } from "./utils/constants";
export default {
  provide() {
    return {
      [CONTAINER]: this,
    };
  },
  props: {
    // 列的数量
    columnNumber: {
      type: Number,
      default: 3,
    },
    // 列与列之间的间隔,单位px
    columnSpacing: {
      type: Number,
      default: 10,
    },
    // 行与行之间的间隔,单位px
    rowSpacing: {
      type: Number,
      default: 10,
    },
    sortMode: {
      type: String,
      default: "index",
    },
  },
  data() {
    return {
      W_CONTAINER,
      // #ifndef MP
      renderOptions: {},
      // #endif
      // #ifdef MP
      itemHeights: [],
      // #endif
    };
  },
  created() {
    this.$nextTick(() => {
      // #ifndef MP
      uni.$on(RESIZE, this.startRender);
      // #endif
      // #ifdef MP
      this.startWxRender();
      // #endif
    });
  },
  beforeDestroy() {
    uni.$off(RESIZE);
  },
  methods: {
    // #ifndef MP
    startRender: throttle(async function () {
      this.renderOptions = {
        ...this.$props,
        _t: `${Date.now()}`,
      };
    }, 100),
    // #endif
    // #ifdef MP
    async startWxRender() {
      for (;;) {
        await this.wxRender();
        await sleep(5);
      }
    },
    async wxRender() {
      const startIndex = await this.findChangeIndex(this.$children);
      if (undefined !== startIndex) {
        await this.startLayout(this.$children, startIndex, this.$props);
      }
    },
    async findChangeIndex(elItems) {
      const itemHeights = this.itemHeights;
      for (let i = 0; i < elItems.length; i++) {
        const element = elItems[i];
        let elementRect = await querySelector(`.${W_ITEM}`, element);
        if (
          !elementRect ||
          itemHeights[i]?.height === 0 ||
          itemHeights[i]?.height !== elementRect.height
        ) {
          return i;
        }
      }
    },
    async startLayout(elItems, startIndex, props) {
      let itemHeights = this.itemHeights;
      let newHeights = itemHeights.slice(0, startIndex);
      for (let i = startIndex; i < elItems.length; i++) {
        const element = elItems[i];
        const elementRect = await querySelector(`.${W_ITEM}`, element);
        const height = elementRect.height;
        if (elementRect.height === 0) {
          return;
        }
        const columnIndex = await this[this.sortMode === 'index' ? 'layoutItemByIndex' : 'layoutItem'](
          element,
          i,
          props,
          newHeights
        );
        newHeights.push({
          height,
          columnIndex,
          id: element.id,
        });
      }
      this.itemHeights = newHeights;
    },
    async layoutItem(
      element,
      index,
      { columnNumber, columnSpacing, rowSpacing },
      newHeights = []
    ) {
      const columnInfo = this.getColumnInfo(newHeights, columnNumber);
      const elContainer = await querySelector(`.${W_CONTAINER}`, this);
      const containerWidth = elContainer.width;
      const coulumnSpacingWidth = (columnNumber - 1) * columnSpacing;
      const coulumnWidth =
        (containerWidth - coulumnSpacingWidth) / columnNumber;
      const left = (coulumnWidth + columnSpacing) * columnInfo.minColumnIndex;
      const top =
        columnInfo.minColumnTotal +
        rowSpacing * columnInfo.columns[columnInfo.minColumnIndex].list.length;
      element.setStyle({
        left: `${left}px`,
        top: `${top}px`,
        opacity: 1,
      });
      return columnInfo.minColumnIndex;
    },
    async layoutItemByIndex(
      element,
      index,
      { columnNumber, columnSpacing, rowSpacing },
      newHeights = []
    ) {
      // 按顺序分配列，使用 index % columnNumber 来决定元素放在第几列
      const columnIndex = index % columnNumber;

      // 计算该列之前的元素总高度
      const columnElements = newHeights.filter(
        (item) => item.columnIndex === columnIndex
      );
      const top = columnElements.reduce(
        (sum, item) => sum + item.height + rowSpacing,
        0
      );

      // 计算容器宽度和每列宽度
      const elContainer = await querySelector(`.${W_CONTAINER}`, this);
      const containerWidth = elContainer.width;
      const coulumnSpacingWidth = (columnNumber - 1) * columnSpacing;
      const coulumnWidth =
        (containerWidth - coulumnSpacingWidth) / columnNumber;

      // 计算 left 值
      const left = (coulumnWidth + columnSpacing) * columnIndex;

      // 设置元素样式
      element.setStyle({
        left: `${left}px`,
        top: `${top}px`,
        opacity: 1,
      });

      return columnIndex;
    },
    getColumnInfo(arr, columnNumber) {
      let columns = {},
        minColumnIndex = 0,
        minColumnTotal = Infinity;
      for (let i = 0; i < columnNumber; i++) {
        const list = arr.filter((v) => v.columnIndex === i);
        const total = list.reduce((i, j) => i + j.height, 0);
        columns[i] = {
          list,
          total,
        };
        if (minColumnTotal > total) {
          minColumnIndex = i;
        }
        minColumnTotal = Math.min(minColumnTotal, total);
      }
      return {
        columns,
        minColumnIndex,
        minColumnTotal,
      };
    },
    // #endif
  },
};
</script>


<style scoped>
.w__container {
  width: 100%;
  position: relative;
}
</style>