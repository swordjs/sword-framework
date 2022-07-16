import { readFileSync } from 'fs';
import { resolve } from 'path';

// 从tsconfig.json读取paths, 转换成通用的alias
// tsconfig的路径可以设置
// 如果当前运行函数的环境是packages子包中, 则就是../../tsconfig.json(根目录下的tsconfig.json)
// 如果当前运行环境不是子包, 就可以指定tsconfig.json的路径
export default (tsconfigBaseUrl = '../../tsconfig.json'): Record<string, string> => {
  const paths = JSON.parse(readFileSync(resolve(tsconfigBaseUrl)).toString()).compilerOptions.paths;
  // 根据tsconfigBaseUrl的路径, 获取路径前的./ 或者 ../
  // 这样alias的值就是相对于当前运行函数的环境的路径
  const baseUrl = tsconfigBaseUrl.replace(/[^/]*$/, '');
  const alias: any = {};
  for (const key in paths) {
    alias[key.replace('/*', '')] = resolve(baseUrl, paths[key][0].replace('/*', ''));
  }
  return alias;
};
