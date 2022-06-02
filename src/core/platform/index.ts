import { commandArgs } from '../../util/config';

/**
 * 根据不同平台, 传入不同的函数, 并且返回
 * @param {(Record<typeof commandArgs.platform, () => Promise<any> | any>)} params
 * @return {*}
 */
export const platformHook = async <R = any>(
  params: Partial<Record<typeof commandArgs.platform, () => Promise<R> | R>>,
  platform = commandArgs.platform
): Promise<R | undefined> => {
  // 判断存在且是函数
  if (params[platform] && typeof params[platform] === 'function') {
    return await (params[platform] as () => R)();
  }
};
