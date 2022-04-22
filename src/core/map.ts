import { traverseSourceDir } from '../util/file';
import { createRequire } from 'module';
import { resolve } from 'path';
import { log } from './log';
import type { HttpInstructMethod, HttpApiReturn, HttpContext } from '../../typings/index';
import { cwd } from 'process';
export type Map = {
  sourcePath: string;
  method: HttpInstructMethod[];
  handler: (ctx: HttpContext<any>) => void;
};

/**
 * 生成api
 * @param {string} dir
 * @return {*}
 */
export const getApiMap = async (
  dir = 'src',
  apiDir = 'api'
): Promise<{
  apiMap: Record<string, Map>;
}> => {
  const require = createRequire(import.meta.url);
  // 构建API Map
  const apiMap: Record<string, Map> = {};
  const files = traverseSourceDir(resolve(dir, apiDir));
  for (const key in files) {
    // 解构path和d
    const [path, d] = files[key];
    // 注册API和proto到map中
    if (['index.ts', 'index.js'].includes(d)) {
      // apiPath 比如hello/detail 诸如此类
      const apiPath = path.substring(path.lastIndexOf(apiDir)).substring(apiDir.length);
      // 执行函数，获取instruct指示器
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(path);
      if (module.main) {
        const { instruct, handler } = module.main as HttpApiReturn<any>;
        const currentPath = getKey(`/${apiDir}`, apiPath, instruct.path);
        // 判断apiMap中已存在某个apikey，那么就提示api被占用，那么此时默认将不会按照指示器中的path进行替换赋值
        if (apiMap[currentPath]) {
          log().err(`${currentPath}路由已被占用，已跳过`);
          continue;
        } else {
          apiMap[currentPath] = {
            sourcePath: resolve(path, d),
            method: instruct.method,
            handler
          };
        }
      }
    }
  }
  return {
    apiMap
  };
};

// 获取map的存储key
const getKey = (urlPrefix: string, apiPath: string, path?: string) => {
  return `${urlPrefix}${path ? path : apiPath}`;
};
