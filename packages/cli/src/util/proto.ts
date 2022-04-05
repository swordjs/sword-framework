import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { writeFileRecursive, traverseSourceDir } from './file';
import log from '../log';
import type { HttpApiReturn } from '../../../../typings/index';

// 获取map的存储key
const getProtoMapKey = (urlPrefix: string, apiPath: string, path?: string) => {
  let currentPath = null;
  if (path) {
    currentPath = path;
  } else {
    currentPath = urlPrefix + apiPath;
  }
  return currentPath;
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
  // apiPaths用于cli构建产物，用于esbuild打包分析
  apiPaths: string[];
  protoMap: Record<string, string>;
}> => {
  const require = createRequire(import.meta.url);
  const apiPaths: string[] = [];
  const protoMap: Record<string, string> = {};
  const files = traverseSourceDir(resolve(dir, apiDir));
  let currentPath = null;
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
        currentPath = getProtoMapKey(`/${apiDir}`, apiPath, instruct.path);
      } else if (d === 'proto.ts') {
        protoMap[currentPath as unknown as string] = resolve(path, d);
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
 * 生成protoschema到指定目录中
 * @param {string} outPath
 * @return {*}  {Promise<string[]>}
 */
export const generateProtoSchema = async (outPath: string): Promise<string[]> => {
  const { protoMap: _protoMap, apiPaths } = await getProtoMap();
  const result: Record<string, Record<string, unknown>> = {};
  for (const key in _protoMap) {
    const generator = new TSBufferProtoGenerator();
    result[key] = await generator.generate(_protoMap[key]);
  }
  // 生成proto json文件到指定目录
  await writeFileRecursive(outPath, JSON.stringify(result))
    .then(() => {
      log.success('Proto加载成功');
    })
    .catch((e) => {
      log.err(`Proto加载错误, ${JSON.stringify(e)}`);
    });
  return apiPaths;
};
