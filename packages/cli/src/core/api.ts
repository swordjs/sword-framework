import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { traverseSourceDir, writeFileRecursive } from '~util/file';
import { getKey } from '~util/map';
import log from '../log';
import { existsSync } from 'fs';
import type { HttpApiReturn, HttpApiInstructType } from '#types/index';

type Map = Record<string, { path: string; method: string[]; protoPath?: string; type: HttpApiInstructType }>;

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
        const { instruct }: HttpApiReturn<any> = module.default ?? module.main;
        // 解析instruct, 是一个map
        instruct.forEach((value, key) => {
          const _key = getKey(`/${apiDir}`, apiPath, key);
          apiMap[_key] = {
            path: modulePath,
            type: value.type,
            // set转换成数组
            method: [...value.methods]
          };
          // 如果当前目录下，存在proto.ts文件，则记录
          if (existsSync(resolve(path, 'proto.ts'))) {
            apiMap[_key] = { ...apiMap[_key], protoPath: resolve(path, 'proto.ts') };
          }
        });
      }
    }
  }
  return {
    apiPaths,
    apiMap
  };
};

export type Result = Record<
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
      if (apiMap[key].protoPath) {
        result[key] = {
          proto: await generator.generate(apiMap[key].protoPath as any),
          ...(options.dev
            ? {
                path: apiMap[key].path,
                method: apiMap[key].method,
                protoPath: apiMap[key].protoPath,
                type: apiMap[key].type
              }
            : {})
        };
      }
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
