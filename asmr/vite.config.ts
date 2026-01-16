import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from 'node:url'
import uni from "@dcloudio/vite-plugin-uni";
import autoImport from 'unplugin-auto-import/vite';
import setupExtend from 'vite-plugin-vue-setup-extend';
import h5ProdEffectPlugin from 'uni-vite-plugin-h5-prod-effect'
import injectTemplateToPages from './vite/plugins/injectTemplateToPages'
import themeScssGenerator from './vite/plugins/themeScssGenerator' // 引入插件
import fs from 'fs-extra'; // 
import path from 'path'; // 
// unocss
import viteVueUnocss, { unocss } from './vite/plugins/js_sdk/a-hua-unocss'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const themeConfig = Object.keys(env).filter(key => key.startsWith('VITE_APP_THEME')).reduce((prev, cur) => {
    prev[cur.slice(15).toLowerCase()] = env[cur];
    return prev;
  }, {});

  const currentPlatform = process.env.UNI_PLATFORM?.replace(/-/g, '_');
  const systemConfig = Object.keys(env).reduce((config, key) => {
    if (key.startsWith("VITE_APP_SYSTEM_")) {
      const configName = key.split("_").pop(); // 直接取最后一个下划线后的内容
      if (!configName) return config;
      if (key === `VITE_APP_SYSTEM_${currentPlatform}_${configName}`) {
        config[configName] = env[key];
      }
      // 2. 如果没有平台前缀，并且当前配置项尚未设置（即没有平台特定配置），则使用默认值
      else if (!key.includes("_", 20) && !config.hasOwnProperty(configName)) {
        config[configName] = env[key];
      }

    }
    return config;
  }, {});
  console.log('systemConfig :>> ', systemConfig);
  let build;
  const isProd = env.VITE_APP_ENV === 'prod';
  const isApp = process.env.UNI_PLATFORM === 'app';
  console.log('build :>> ', isApp, process.env.UNI_PLATFORM, isProd);
  if (isProd) {
    console.log('env :>> ', mode);
    build = {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          booleans_as_integers: false, // 布尔转数字
          keep_infinity: true,
          pure_funcs: ['console.log', 'console.debug'],
          drop_console: true, // 删除所有的 `console` 语句，包括注释掉的 console 语句
          drop_debugger: true, // 删除所有的 `debugger` 语句
          passes: 3 // 压缩次数
        },
        // mangle: {
        //   properties: {
        //     regex: /^_/, // 混淆以下划线开头的成员
        //   }
        // },
        format: {
          comments: false // 使用 Terser 时移除注释
        }
      }
    }
  }
  themeScssGenerator({
    themeConfig,
    outputPath: 'src/styles/themeVar.scss',
    ossUrl: env.VITE_APP_OSS_URL
  })

  return {
    server: {
      proxy: {
        '/api': {
          target: 'https://test-bmo-api.kuaifuinfo.com',
          changeOrigin: true,
          rewrite: path => {
            return path.replace('/api', '')
          },
        },
      }
    },
    plugins: [
      uni(),
      viteVueUnocss({
        presets: [
          unocss()
        ]
      }),
      autoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: false,
      }),
      setupExtend(),
      h5ProdEffectPlugin(),
      injectTemplateToPages('<custom-notice ref="customNoticeRef" />'),
      { // 
        name: 'copy-unpackage', // 
        apply: 'build', // 
        closeBundle: () => { // 
          if(isApp){
            const src = path.resolve(__dirname, 'unpackage'); // 
            const dest = path.resolve(__dirname, 'dist' + ( isProd ? '/build/app' : '/dev/app'), 'unpackage'); // 
            if (fs.existsSync(src)) { // 
              fs.copySync(src, dest); // 
              console.log('unpackage directory copied to dist');
            } else { // 
              console.warn('unpackage directory does not exist');
            }
          }
        }
      }
    ],
    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       additionalData: `@import "@/styles/themeVar.scss";`
    //     }
    //   }
    // },
    css: {
      preprocessorOptions: {
        sass: {
          // 忽略所有相关的 deprecation 警告
          silenceDeprecations: [
            'global-builtin',    // 全局内置函数（如 str-index）
            'new-global',        // !global 声明新变量
            'import',            // @import 语法废弃
            'legacy-js-api'      // 遗留 JS API 警告
          ]
        },
        scss: {
          // SCSS 与 Sass 配置一致（SCSS 是 Sass 的超集）
          silenceDeprecations: [
            'global-builtin',
            'new-global',
            'import',
            'legacy-js-api'
          ]
        }
      }
    },
    // 注入环境变量到代码
    define: {
      // 基础接口地址
      'BASE_URL': JSON.stringify(env.VITE_APP_BASE_API_URL),
      // GRAPHQL 接口地址
      'GRAPHQL_URL': JSON.stringify(env.VITE_APP_GQL_API_URL),
      // 应用环境
      'APP_ENV': JSON.stringify(env.VITE_APP_ENV),
      // 主题配置
      'THEME_CONFIG': JSON.stringify(themeConfig),
      // OSS 链接
      'OSS_URL': JSON.stringify(env.VITE_APP_OSS_URL),
      // 不同平台配置项
      'SYSTEM_CONFIG': JSON.stringify(systemConfig),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    build
  }
});
