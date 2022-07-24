import { resolve } from 'path';
import { writeFileRecursive } from '~util/file';
import log from './../log';
import type { Argv } from 'mri';
import type { CommandConfig } from '#types/config';

/**
 * 生成预先设置的API结构
 * @param {string} sourceDir
 * @param {string} dir
 */
export default (args: Argv<CommandConfig>) => {
  console.log(args);
  if (!args['presetApi-name']) {
    log.err('presetApi-name is required');
  } else {
    presetApi('src', '/', args['presetApi-name']);
  }
};

export const presetApi = (sourceDir: string, parentDir: string, dir: string): [string, string[]] => {
  // 删除前缀后的root根节点路由
  // 处理parnetDir的路径，使之能够通过/进行分割成多个文件夹，比如/level1/level2 会被分割成['level1', 'level2']，这会让resolve更好工作
  const _parentDir = parentDir.split('/');
  const cwd = process.cwd();
  // 生成proto
  writeFileRecursive(
    `${resolve(cwd, sourceDir, 'api', ..._parentDir, dir, 'proto.ts')}`,
    `export interface ReqParams {}
export interface ReqQuery {}
export interface Res {
  message: string;
}
`
  );
  // 生成API
  writeFileRecursive(
    `${resolve(cwd, sourceDir, 'api', ..._parentDir, dir, 'index.ts')}`,
    `import { useApi } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: async (ctx) => {
    return {
      message: 'hello'
    };
  }
});
`
  );
  return [cwd, _parentDir];
};
