import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'module';
import { traverseSourceDir } from '~util/file';
import { getSourcePath } from '~util/path';
import { getKey } from '~util/map';
import { log } from './log';
import type { HttpInstructMethod, HttpApiReturn, HttpContext, HttpApiInstructType } from '#types/index';
import type { Result as ApiJSON } from '@cli/core/api';

export type Map = {
  sourcePath: string;
  method: HttpInstructMethod[];
  type: HttpApiInstructType;
  proto: Record<string, any> | null;
  handler: (ctx: HttpContext<any>) => void;
};

/**
 * 生成api map
 * @param {string} dir
 * @return {*}
 */
export const getApiMap = async (params?: {
  // 根文件夹
  dir?: string;
  // api文件夹
  apiDir?: string;
  // 完全匹配的api路径, 如果提供了这个参数, 那么函数会有目的性地去找此api并且仅返回匹配成功的map, 否则会迭代所有的api
  apiPath?: string;
}): Promise<{
  apiMap: Record<string, Map>;
}> => {
  const { dir = 'src', apiDir = 'api' } = params ?? {};
  // 获取api.json
  const apiJson = JSON.parse(readFileSync(resolve('src', 'api.json')).toString()) as ApiJSON;
  const sourcePath = getSourcePath(`${dir}/${apiDir}`);
  const require = createRequire(import.meta.url);
  // 构建API Map
  const apiMap: Record<string, Map> = {};
  const files = traverseSourceDir(sourcePath);
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
      // 如果模块是默认导出或者导出main
      if (module.default || module.main) {
        const { instruct, handler }: HttpApiReturn<any> = module.default ?? module.main;
        instruct.forEach((value, key) => {
          const _key = getKey(`/${apiDir}`, apiPath, key);
          // 缓存map的value对象
          const mapValue: Map = {
            sourcePath,
            method: [...value.methods],
            type: value.type,
            proto: apiJson[_key].proto ?? null,
            handler
          };
          // 判断apiMap中已存在某个apikey，那么就提示api被占用，那么此时默认将不会按照指示器中的path进行替换赋值
          if (apiMap[_key] && value.type === 'mandatory' && apiMap[_key].type === 'mandatory') {
            // 都是强制定义的, 所以需要打印警告: 强制定义了多次api, 这会增大你的维护难度, 请谨慎选择
            log().info(`api ${_key} is Mandatory defined multiple times, please be careful`);
          }
          // 如果不存在路由, 则直接赋值
          // 如果map当前存在此path, 那么查看本次path中的路由类型, 如果本次是file-system, 就替换
          if ((apiMap[_key] && value.type === 'file-system' && apiMap[_key].type === 'mandatory') || !apiMap[_key]) {
            apiMap[_key] = mapValue;
          }
        });
      }
    }
  }
  return {
    apiMap
  };
};
