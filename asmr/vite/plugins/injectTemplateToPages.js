/**
 * 页面级注入全局组件
 * @param {string} comp 注入的组件
 * @returns {import('vite').PluginOption} config
 */

export default (comp) => {
  return {
    name: 'injectTemplateToPages',
    enforce: 'pre',
    // code 代码，id 文件路径
    transform(code, id) {
      // vue文件，且不是App.vue，不是components目录下的文件
      const shouldInject =
        /\.vue$/.test(id) && !/App\.vue$/.test(id) && !/components/.test(id);
      if (shouldInject) {
        // 注入模板代码到template内的第一个view标签下
        code = code.replace(/(<template[^>]*>\s*<view[^>]*>)/, (_, match) => `${match}${comp}`);
      }

      return {
        code,
        map: null,
      };
    },
  };
};