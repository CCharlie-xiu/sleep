import fs from 'fs';
import path from 'path';

// 添加生成方法到插件上下文
function themeScssGenerator({
  themeConfig, outputPath, ossUrl
}) {
  let scssContent = 'body, page{';

  // 将主题配置转换为 SCSS 变量
  Object.keys(themeConfig).forEach(key => {
    scssContent += `--${key}:${themeConfig[key]};`;
  });

  // 添加背景图变量
  if (themeConfig.name) {
    console.log('ossUrl :>> ', ossUrl);
    scssContent += `--theme-bg-url:url(${ossUrl}/static/common/${themeConfig.name}/bg.png);}`;
  }

  // 确保输出目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(outputPath, scssContent);
  console.log(`Theme SCSS file generated at: ${outputPath}`);
};

export default themeScssGenerator;