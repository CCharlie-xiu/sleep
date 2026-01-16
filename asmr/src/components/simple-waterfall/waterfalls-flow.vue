<template>
  <view class="waterfalls-flow">
    <view
      v-for="(item, index) in data.column"
      :key="index"
      class="waterfalls-flow-column"
      :id="`waterfalls_flow_column_${index + 1}`"
      :style="{ width: w, 'margin-left': index == 0 ? 0 : columnSpaceRpx + 'rpx' }"
    >
      <view
        :class="['column-value', { 'column-value-show': item2.o }]"
        v-for="(item2, index2) in columnValue(index)"
        :key="item2._uniqueKey || (item2.index + '_' + index2)"
        :style="[s1]"
        @click.stop="wapperClick(item2)"
      >
        <view class="inner" v-if="data.seat == 1">
          <!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
          <!-- #ifdef VUE2 -->
          <slot name="slot{{item2.index}}"></slot>
          <!-- #endif -->
          <!-- #ifdef VUE3 -->
          <slot :name="`slot${item2.index}`"></slot>
          <!-- #endif -->
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN || MP-KUAISHOU -->
          <slot v-bind="item2"></slot>
          <!-- #endif -->
        </view>
        <view class="inner" v-if="data.seat == 2">
          <!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
          <!-- #ifdef VUE2 -->
          <slot name="slot{{item2.index}}"></slot>
          <!-- #endif -->
          <!-- #ifdef VUE3 -->
          <slot :name="`slot${item2.index}`"></slot>
          <!-- #endif -->
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN || MP-KUAISHOU -->
          <slot v-bind="item2"></slot>
          <!-- #endif -->
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ossResizeUrl } from "@/common/utils/util";

export default {
  props: {
    value: Array,
    column: {
      type: [String, Number],
      default: 2,
    },
    maxColumn: {
      type: [String, Number],
      default: 5,
    },
    columnSpace: {
      type: [String, Number],
      default: 0,
    },
    imageKey: {
      type: [String],
      default: "accessUrl",
    },
    hideImageKey: {
      type: [String],
      default: "hide",
    },
    seat: {
      type: [String, Number],
      default: 2,
    },
    listStyle: {
      type: Object,
    },
    computeMode: {
      type: String,
      default: 'precompute'
    },
    containerWidth: {
      type: Number,
      default: 0
    },
    // 新增：批量渲染数量，一次渲染多少个item
    batchRenderCount: {
      type: Number,
      default: 10
    },
    // 新增：是否按顺序渲染（不使用补短逻辑）
    sequentialRender: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      data: {
        list: [],
        column: this.column < 2 ? 2 : this.column,
        columnSpace: this.columnSpace <= 5 ? this.columnSpace : 5,
        imageKey: this.imageKey,
        seat: this.seat,
      },
      listInitStyle: {},
      adds: [],
      isLoaded: true,
      curIndex: 0,
      isRefresh: true,
      refreshDatas: [],
      columnHeights: [],
      // 用于优化渲染的批处理
      pendingItems: [],
      renderTimer: null,
      valueTimer: null,
      // 列数据缓存，避免重新创建数组
      columnDataCache: {},
      // 为每个项目生成唯一键
      itemCounter: 0,
      // 顺序渲染相关
      currentColumn: 1 // 顺序渲染时当前应该分配到的列
    };
  },
  computed: {
    w() {
      if (this.containerWidth > 0) {
        const spaceTotal = (this.data.column - 1) * this.columnSpaceRpx;
        const columnWidth = (this.containerWidth - spaceTotal) / this.data.column;
        return columnWidth + 'rpx';
      }
      const column_rate = `${100 / this.data.column - +this.data.columnSpace}%`;
      return column_rate;
    },
    columnSpaceRpx() {
      return Number(this.columnSpace) || 0;
    },
    s1() {
      return { ...this.listInitStyle, ...this.listStyle };
    },
  },
  created() {
    this.refresh();
  },
  methods: {
    ossResizeUrl,
    refresh(isAppend = false) {
      console.debug('refresh debug ====> ', isAppend);
      if (!this.isLoaded) {
        this.refreshDatas = this.value;
        return false;
      }
      
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }
      
      this.refreshDatas = [];
      this.isRefresh = true;
      this.adds = [];
      
      if (!isAppend) {
        // 初始化刷新
        this.data.list = this.value ? [...this.value] : [];
        this.data.column =
          this.column < 2
            ? 2
            : this.column >= this.maxColumn
            ? this.maxColumn
            : this.column;
        this.data.columnSpace = this.columnSpace <= 5 ? this.columnSpace : 5;
        this.data.imageKey = this.imageKey;
        this.data.seat = this.seat;
        this.curIndex = 0;
        this.itemCounter = 0;
        this.currentColumn = 1; // 重置当前列
        
        // 初始化每列高度缓存
        this.columnHeights = Array(this.data.column).fill(0);
        
        // 初始化列数据缓存
        this.columnDataCache = {};
        for (let i = 1; i <= this.data.column; i++) {
          this.columnDataCache[i] = [];
          this.data[`column_${i}_values`] = this.columnDataCache[i];
        }
        
        this.$nextTick(() => {
          // 正确设置 pendingItems 并启动渲染
          this.pendingItems = [...this.data.list];
          this.data.list = []; // 清空原始列表，使用 pendingItems 渲染
          this.curIndex = 0;
          this.isLoaded = true;
          this.isRefresh = false;
          // 立即启动渲染
          if (this.sequentialRender) {
            this.processSequentialItems();
          } else {
            this.processBatchItems();
          }
        });
      } else {
        // 增量加载
        this.data.list = this.value ? [...this.value] : [];
        this.isRefresh = false;
        this.isLoaded = true;
        
        this.$nextTick(() => {
          // 只处理新增的数据
          const newItems = this.data.list.slice(this.curIndex);
          this.pendingItems = [...this.pendingItems, ...newItems];
          if (this.sequentialRender) {
            this.processSequentialItems();
          } else {
            this.processBatchItems();
          }
        });
      }
    },
    columnValue(index) {
      return this.columnDataCache[index + 1] || [];
    },
    // 获取下一个应该分配的列（顺序渲染）
    getNextColumn() {
      const column = this.currentColumn;
      this.currentColumn = this.currentColumn >= this.data.column ? 1 : this.currentColumn + 1;
      return column;
    },
    // 获取最小高度列（原有逻辑）
    getMinColumnHeight() {
      return new Promise((resolve) => {
        const heightArr = [];
        let completed = 0;
        for (let i = 1; i <= this.data.column; i++) {
          const query = uni.createSelectorQuery().in(this);
          query
            .select(`#waterfalls_flow_column_${i}`)
            .boundingClientRect((data) => {
              heightArr.push({ column: i, height: data ? data.height : 0 });
              completed++;
              if (completed === this.data.column) {
                let m = heightArr[0].height;
                let mo = heightArr[0];
                for (var j = heightArr.length - 1; j >= 0; j--) {
                  if (heightArr[j].height < m) {
                    m = heightArr[j].height;
                    mo = heightArr[j];
                  }
                }
                resolve(mo);
              }
            })
            .exec();
        }
      });
    },
    // 获取最小高度列（预计算模式）
    getMinColumnByPrecompute() {
      let minHeight = this.columnHeights[0];
      let minIndex = 0;
      
      for (let i = 1; i < this.columnHeights.length; i++) {
        if (this.columnHeights[i] < minHeight) {
          minHeight = this.columnHeights[i];
          minIndex = i;
        }
      }
      
      return {
        column: minIndex + 1,
        height: minHeight
      };
    },
    // 顺序渲染处理
    async processSequentialItems() {
      if (this.pendingItems.length === 0) {
        this.loaded();
        return;
      }
      
      // 处理一批数据
      const batchSize = Math.min(this.batchRenderCount, this.pendingItems.length);
      
      // 收集这批数据
      const batchItems = [];
      for (let i = 0; i < batchSize; i++) {
        if (this.pendingItems.length > 0) {
          batchItems.push(this.pendingItems.shift());
        }
      }
      
      // 按顺序分配列
      const allocations = [];
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        const column = this.getNextColumn(); // 按顺序获取列
        
        allocations.push({
          item,
          column: column,
          columnIndex: column - 1
        });
      }
      
      // 批量添加到对应列中
      const updates = {};
      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        const item = allocation.item;
        const column = allocation.column;
        
        // 为每个项目生成唯一键
        const uniqueKey = `item_${this.curIndex + i}_${this.itemCounter++}`;
        
        const processedItem = {
          ...item,
          column: column,
          index: this.curIndex + i,
          cIndex: this.columnDataCache[column].length,
          o: 1,
          _uniqueKey: uniqueKey
        };
        
        // 添加到对应列缓存中
        if (!updates[column]) {
          updates[column] = [];
        }
        updates[column].push(processedItem);
      }
      
      // 批量更新各列数据
      Object.keys(updates).forEach(column => {
        const newItems = updates[column];
        this.columnDataCache[column].push(...newItems);
        
        // 更新实际高度
        newItems.forEach(item => {
          if (this.computeMode === 'precompute' && item.coverEntity) {
            const itemHeight = item.coverEntity.realHeight || 0;
            this.columnHeights[column - 1] += itemHeight;
          }
        });
      });
      
      this.curIndex += batchItems.length;
      
      // 使用 nextTick 确保 DOM 更新完成
      this.$nextTick(() => {
        // 如果还有数据需要处理，安排下一批
        if (this.pendingItems.length > 0) {
          this.renderTimer = setTimeout(() => {
            this.processSequentialItems();
          }, 0); // 无延迟处理，提高性能
        } else {
          this.loaded();
        }
      });
    },
    async processBatchItems() {
      if (this.pendingItems.length === 0) {
        this.loaded();
        return;
      }
      
      // 处理一批数据
      const batchSize = Math.min(this.batchRenderCount, this.pendingItems.length);
      
      // 收集这批数据
      const batchItems = [];
      for (let i = 0; i < batchSize; i++) {
        if (this.pendingItems.length > 0) {
          batchItems.push(this.pendingItems.shift());
        }
      }
      
      // 为这批数据预先分配列位置
      const allocations = [];
      const tempColumnHeights = [...this.columnHeights]; // 使用临时高度数组
      
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        let columnInfo;
        
        if (this.computeMode === 'precompute') {
          // 使用临时高度数组计算最小列
          let minHeight = tempColumnHeights[0];
          let minIndex = 0;
          for (let j = 1; j < tempColumnHeights.length; j++) {
            if (tempColumnHeights[j] < minHeight) {
              minHeight = tempColumnHeights[j];
              minIndex = j;
            }
          }
          columnInfo = {
            column: minIndex + 1,
            columnIndex: minIndex
          };
        } else {
          columnInfo = await this.getMinColumnHeight();
        }
        
        allocations.push({
          item,
          column: columnInfo.column,
          columnIndex: columnInfo.columnIndex
        });
        
        // 更新临时高度数组
        if (this.computeMode === 'precompute' && item.coverEntity) {
          const itemHeight = item.coverEntity.realHeight || 0;
          tempColumnHeights[columnInfo.columnIndex] += itemHeight;
        }
      }
      
      // 批量添加到对应列中
      const updates = {};
      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        const item = allocation.item;
        const column = allocation.column;
        
        // 为每个项目生成唯一键
        const uniqueKey = `item_${this.curIndex + i}_${this.itemCounter++}`;
        
        const processedItem = {
          ...item,
          column: column,
          index: this.curIndex + i,
          cIndex: this.columnDataCache[column].length,
          o: 1,
          _uniqueKey: uniqueKey
        };
        
        // 添加到对应列缓存中
        if (!updates[column]) {
          updates[column] = [];
        }
        updates[column].push(processedItem);
      }
      
      // 批量更新各列数据
      Object.keys(updates).forEach(column => {
        const newItems = updates[column];
        this.columnDataCache[column].push(...newItems);
        
        // 更新实际高度
        newItems.forEach(item => {
          if (this.computeMode === 'precompute' && item.coverEntity) {
            const itemHeight = item.coverEntity.realHeight || 0;
            this.columnHeights[column - 1] += itemHeight;
          }
        });
      });
      
      this.curIndex += batchItems.length;
      
      // 使用 nextTick 确保 DOM 更新完成
      this.$nextTick(() => {
        // 如果还有数据需要处理，安排下一批
        if (this.pendingItems.length > 0) {
          this.renderTimer = setTimeout(() => {
            this.processBatchItems();
          }, 0); // 无延迟处理，提高性能
        } else {
          this.loaded();
        }
      });
    },
    loaded() {
      if (this.refreshDatas.length) {
        this.isLoaded = true;
        this.refresh();
        return false;
      }
      
      if (this.adds.length) {
        const newData = this.adds.shift();
        this.data.list = newData;
        this.refresh(true); // 增量刷新
      } else {
        if (this.curIndex > 0) this.$emit("loaded");
        this.isLoaded = true;
        this.isRefresh = false;
      }
    },
    wapperClick(item) {
      this.$emit("wapperClick", item);
    },
    imageClick(item) {
      this.$emit("imageClick", item);
    }
  },
  watch: {
    'value.length': {
      handler(newValue, oldValue) {
        // 使用防抖优化
        if (this.valueTimer) {
          clearTimeout(this.valueTimer);
        }
        
        this.valueTimer = setTimeout(() => {
          if (this.isRefresh && newValue === oldValue) return false;
          if (this.isLoaded) {
            this.data.list = this.value ? [...this.value] : [];
            // 判断是初始化还是增量加载
            const isAppend = newValue > oldValue;
            this.refresh(isAppend);
          } else {
            this.adds.push(this.value ? [...this.value] : []);
          }
        }, 10);
      },
    },
    column(newValue) {
      this.refresh();
    },
  },
};
</script>

<style lang="scss" scoped>
.waterfalls-flow {
  overflow: hidden;
  display: flex;
  flex-direction: row;

  &-column {
    display: flex;
    flex-direction: column;
  }
}

.column-value {
  width: 100%;
  font-size: 0;
  overflow: hidden;
  opacity: 1;
  transition: none;

  &-show {
    opacity: 1;
  }

  .inner {
    font-size: 30rpx;
  }
}
</style>