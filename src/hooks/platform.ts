import { commandArgs } from '../util/config';
import { platformHook } from '../core/platform';
import type { CommandConfig } from '../../typings/config';

/**
 * 获取程序的运行时环境
 * @example
 *
 * const platform = usePlatform()
 *
 * @return {*}  {CommandConfig['platform']}
 */
export const usePlatform = (): CommandConfig['platform'] => {
  return commandArgs.platform;
};

export const usePlatformHook = platformHook;
