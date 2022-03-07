import { traverseSourceDir } from '../util/file';
import { createRequire } from 'module';
import { resolve } from 'path';
import log from '../log/index';
import type { HttpInstructMethod, HttpApiReturn, HttpContext, Use } from '@sword-code-practice/types/sword-backend-framework';

export type Map = {
  sourcePath: string;
  method: HttpInstructMethod[];
  handler: (ctx: HttpContext<any>) => void;
  validateProto: Use['ValidateProto'];
};

/**
 * 生成api和proto
 * @param {string} dir
 * @return {*}
 */
export const getApiProtoMap = async (
  apiDir: string,
  dir = 'src'
): Promise<{
  apiMap: Record<string, Map>;
  protoMap: Record<string, string>;
}> => {
  const require = createRequire(import.meta.url);
  // 构建API Map
  const apiMap: Record<string, Map> = {};
  // 构建proto Map
  const protoMap: Record<string, string> = {};
  const files = traverseSourceDir(resolve(dir, apiDir));
  for (const key in files) {
    // 解构path和d
    const [path, d] = files[key];
    // apiPath 比如hello/detail 诸如此类
    const apiPath = path.substring(path.lastIndexOf(dir)).substring(dir.length);
    // 执行函数，获取instruct指示器
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { instruct, handler, validateProto } = require(path).main as HttpApiReturn<any>;
    const currentPath = getApiProtoMapKey(`/${apiDir}`, apiPath, instruct.path);
    // 注册API和proto到map中
    if (['index.ts'].includes(d)) {
      // 判断apiMap中已存在某个apikey，那么就提示api被占用，那么此时默认将不会按照指示器中的path进行替换赋值
      if (apiMap[currentPath]) {
        log.err(`${currentPath}路由已被占用，已跳过此路由的挂载`);
        continue;
      } else {
        // 如果此时没有被占用
        apiMap[currentPath] = {
          sourcePath: resolve(path, d),
          method: instruct.method,
          handler,
          validateProto
        };
      }
    } else if (['proto.ts'].includes(d)) {
      protoMap[currentPath] = resolve(path, d);
    }
  }
  return {
    apiMap,
    protoMap
  };
};

// 获取map的存储key
const getApiProtoMapKey = (urlPrefix: string, apiPath: string, path?: string) => {
  let currentPath = null;
  if (path) {
    currentPath = path;
  } else {
    currentPath = urlPrefix + apiPath;
  }
  return currentPath;
};
