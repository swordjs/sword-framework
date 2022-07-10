import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { writeFileRecursive } from './file';
import { traverseSourceDir } from '../../../../util/file';
import { getKey } from '../../../runtime/src/core/map';
import log from '../log';
import type { HttpApiReturn } from '../../../../typings/index';
import { existsSync } from 'fs';

type Map = Record<string, { path: string; method: string[]; protoPath: string }>;

/**
 *
 * 生成apimap以及api路径数组（用于打包产物分析）
 * @param {string} [apiDir='api']
 * @param {string} [dir='src']
 * @return {*}  {Promise<{
 *   // apiPaths用于cli构建产物，用于esbuild打包分析, 只需要真实的api路径，不需要指示器强行修改的api路径
 *   apiPaths: string[];
 *   apiMap: Map;
 * }>}
 */
export const getApiMap = async (
  apiDir = 'api',
  dir = 'src'
): Promise<{
  // apiPaths用于cli构建产物，用于esbuild打包分析, 只需要真实的api路径，不需要指示器强行修改的api路径
  apiPaths: string[];
  apiMap: Map;
}> => {
  const require = createRequire(import.meta.url);
  const apiPaths: string[] = [];
  const apiMap: Map = {};
  const files = traverseSourceDir(resolve(dir, apiDir));
  for (const key in files) {
    // 解构path和d
    const [path, d] = files[key];
    const modulePath = resolve(path, d);
    delete require.cache[modulePath];
    if (['index.ts', 'proto.ts'].includes(d)) {
      // apiPath 比如hello/detail 诸如此类
      const apiPath = path.substring(path.lastIndexOf(apiDir)).substring(apiDir.length);
      // 执行函数，获取instruct指示器
      if (d === 'index.ts') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(modulePath) as any;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { instruct }: HttpApiReturn<any> = module.default ?? module.main;
        const key = getKey(`/${apiDir}`, apiPath, instruct.path);
        apiPaths.push(apiPath);
        apiMap[key] = {
          path: modulePath,
          method: instruct.method
        } as any;
        // 如果当前目录下，存在proto.ts文件，则记录
        if (existsSync(resolve(path, 'proto.ts'))) {
          apiMap[key] = { ...apiMap[key], protoPath: resolve(path, 'proto.ts') };
        }
      }
    }
  }
  return {
    apiPaths,
    apiMap
  };
};

type Result = Record<
  string,
  {
    path?: string;
    method?: string[];
    protoPath?: string;
    proto: Record<string, unknown>;
  }
>;
type Options = {
  dev?: boolean;
  format?: boolean;
  keepComment?: boolean;
};

/**
 *
 * 检索资源目录生成api路径数组 & protoMap & proto ast树
 * @param {(string | null)} outPath
 * @param {Options} [options={
 *     // 是否是dev环境，如果是dev环境，则不生成除了proto的其他内容
 *     dev: false,
 *     // 是否格式化
 *     format: false,
 *     keepComment: false
 *   }]
 * @return {*}  {Promise<{
 *   apiPaths: string[];
 *   apiResult: Result;
 * }>}
 */
export const generateSchema = async (
  outPath: string | null,
  options: Options = {
    // 是否是dev环境，如果是dev环境，则不生成除了proto的其他内容
    dev: false,
    // 是否格式化
    format: false,
    keepComment: false
  }
): Promise<{
  apiPaths: string[];
  apiResult: Result;
}> => {
  const { apiMap, apiPaths } = await getApiMap();
  const result: Result = {};
  try {
    // 迭代apimap
    for (const key in apiMap) {
      // 生成proto信息
      const generator = new TSBufferProtoGenerator({
        keepComment: options.keepComment
      });
      // 如果是dev环境, 则仅仅生成proto
      result[key] = {
        proto: await generator.generate(apiMap[key].protoPath),
        ...(options.dev
          ? {
              path: apiMap[key].path,
              method: apiMap[key].method,
              protoPath: apiMap[key].protoPath
            }
          : {})
      };
    }
    // 判断outPath是否存在，如果存在，就把api.json输出到指定目录
    if (outPath) {
      // 生成api json文件到指定目录
      await writeFileRecursive(outPath, JSON.stringify(result, null, typeof options?.format === 'undefined' ? undefined : 2));
      log.success('API.Schema加载成功');
    }
  } catch (error) {
    log.err(`API.Schema加载错误: ${error}`);
  }
  return { apiPaths, apiResult: result };
};
