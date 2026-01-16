import { useaAppConfigStore } from '@/store/appConfig';
import { getCurrentInstance } from 'vue';

export default {
  async onShareAppMessage(e) {
    const { proxy } = getCurrentInstance();
    const page = proxy.$Router.getRoute();
    let shareData = null;
    // 判断是否有定义 自定义分享方法 要求一定要是 Promise
    if (page.$vm && page.$vm.injectShareAppMessage && typeof page.$vm.injectShareAppMessage === 'function') {
      shareData = await page.$vm.injectShareAppMessage();
    } else {
      const { config } = useaAppConfigStore();
      shareData = {
        title: `来${config.appName}，定制你的壁纸/头像，还能AI喊麦做写真`,
        path: '/pages/index/index',
        imageUrl: OSS_URL + '/static/share/share.png'
      }
    }
    return shareData
  }
}