export default {
  install(app) {
    app.config.globalProperties.$getRect = this.getRect;
  },
  getRect(selector, all) {
    return new Promise((resolve) => {
      let query = uni.createSelectorQuery();
      // #ifndef MP-ALIPAY
      query = query.in(this);
      // #endif
      query[all ? "selectAll" : "select"](selector)
        .boundingClientRect(
          // #ifndef MP-ALIPAY
          (rect) => {
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect);
            }
          }
          // #endif
        )
        .exec(
          // #ifdef MP-ALIPAY
          (rect) => {
            console.debug("exec", rect);
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect.length == 1 ? rect[0] : rect);
            }
          }
          // #endif
        );
    });
  },
};
