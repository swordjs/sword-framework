import { commandArgs } from '../../../../../util/config';

/**
 *
 * 根据不同平台, 传入不同的函数, 并且返回
 * @template R
 * @param {(Partial<Record<typeof commandArgs.platform | 'default', () => Promise<R> | R>>)} params
 * @param {*} [platform=commandArgs.platform]
 * @return {*}  {(Promise<R | undefined>)}
 */
export const platformHook = async <R = any>(
  params: Partial<Record<typeof commandArgs.platform | 'default', () => Promise<R> | R>>,
  platform = commandArgs.platform
): Promise<R | undefined> => {
  // 判断存在且是函数
  if (params[platform] && typeof params[platform] === 'function') {
    return await (params[platform] as () => R)();
  } else if (params['default'] && typeof params['default'] === 'function') {
    // 如果不存在，则默认default函数返回值
    return await (params['default'] as () => R)();
  }
};
