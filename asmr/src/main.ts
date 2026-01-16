import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { setupRouter } from './router/index' // 引入路由
import routerJump from './router/routerJump';
import staticPath from './common/plugins/staticPath';
import system from './common/plugins/system';
import theme from './common/plugins/theme';
import user from './common/plugins/user';
import util from './common/plugins/util';
import Tips from './common/utils/tips';
import adManage from './common/ad/manage';
import shareMixin from './common/plugins/shareMixin';

export function createApp() {
  const app = createSSRApp(App);
  app
    .use(createPinia())
    .use(routerJump)
    .use(system)
    .use(theme)
    .use(staticPath)
    .use(user)
    .use(util)
    .use(Tips)
    .use(adManage)

  app.mixin(shareMixin);
  setupRouter(app)
  return {
    app,
  };
}
