import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { writeFileRecursive, traverseSourceDir } from './file';
import log from '../log';
import type { HttpApiReturn } from '../../../../typings/index';
import { existsSync } from 'fs';

// 获取map的存储key
const getKey = (urlPrefix: string, apiPath: string, path?: string) => {
  return `${urlPrefix}${path ? path : apiPath}`;
};

/**
 *
 * 生成protomap以及api路径数组（用于打包产物分析）
 * @param {string} apiDir
 * @param {string} [dir='src']
 * @return {*}  {Promise<{
 *   // apiPaths用于cli构建产物，用于esbuild打包分析
 *   apiPaths: string[];
 *   protoMap: Record<string, string>;
 * }>}
 */
export const getProtoMap = async (
  apiDir = 'api',
  dir = 'src'
): Promise<{
  // apiPaths用于cli构建产物，用于esbuild打包分析, 只需要真实的api路径，不需要指示器强行修改的api路径
  apiPaths: string[];
  protoMap: Record<string, string>;
}> => {
  const require = createRequire(import.meta.url);
  const apiPaths: string[] = [];
  const protoMap: Record<string, string> = {};
  const files = traverseSourceDir(resolve(dir, apiDir));
  for (const key in files) {
    // 解构path和d
    const [path, d] = files[key];
    const module = resolve(path, d);
    delete require.cache[module];
    if (['index.ts', 'proto.ts'].includes(d)) {
      // apiPath 比如hello/detail 诸如此类
      const apiPath = path.substring(path.lastIndexOf(apiDir)).substring(apiDir.length);
      // 执行函数，获取instruct指示器
      if (d === 'index.ts') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { instruct } = require(module).main as HttpApiReturn<any>;
        apiPaths.push(apiPath);
        // 如果当前目录下，存在proto.ts文件，则记录
        if (existsSync(resolve(path, 'proto.ts'))) {
          protoMap[getKey(`/${apiDir}`, apiPath, instruct.path)] = resolve(path, 'proto.ts');
        }
      }
    }
  }
  return {
    apiPaths,
    protoMap
  };
};

/**
 *
 * 检索资源目录生成api路径数组 & protoMap & proto ast树
 * @param {(string | null)} outPath
 * @param {boolean} [options={
 *     keepComment: false
 *   }]
 * @return {*}  {Promise<{
 *   apiPaths: string[];
 *   protoMap: Record<string, string>;
 *   protoAst: Record<string, Record<string, unknown>>;
 * }>}
 */
export const generateSchema = async (
  outPath: string | null,
  options = {
    keepComment: false
  }
): Promise<{
  apiPaths: string[];
  protoMap: Record<string, string>;
  protoAst: Record<string, Record<string, unknown>>;
}> => {
  const { protoMap: _protoMap, apiPaths } = await getProtoMap();
  const result: Record<string, Record<string, unknown>> = {};
  try {
    for (const key in _protoMap) {
      const generator = new TSBufferProtoGenerator({
        keepComment: options.keepComment
      });
      result[key] = await generator.generate(_protoMap[key]);
    }
    // 判断outPath是否存在，如果存在，就把proto输出到指定目录
    if (outPath) {
      // 生成proto json文件到指定目录
      await writeFileRecursive(outPath, JSON.stringify(result));
      log.success('Proto加载成功');
    }
  } catch (error) {
    log.err(`Proto加载错误: ${error}`);
  }
  return { apiPaths, protoMap: _protoMap, protoAst: result };
};
