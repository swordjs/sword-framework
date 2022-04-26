import { parseCommandArgs } from '../util/config';
import { env as uniclouEnv } from '../env/unicloud';
import type { CommandConfig } from '../../typings/config';
import { resolve } from 'path';

const commandArgs = parseCommandArgs();

/**
 *
 * 获取资源路径,区分不同的平台
 * @description 比如server,就直接取路径即可,但是如果是unicloud等其他环境,需要做一些其他的特殊处理
 * @param {string} path
 * @return {*}
 */
export const getSourcePath = (path: string) => {
  const pathMap: Record<CommandConfig['platform'], () => string> = {
    unicloud: () => resolve(process.env[uniclouEnv.symlinkSourcePath] as string, path),
    server: () => resolve(path)
  };
  return pathMap[commandArgs.platform]();
};
