import { isDev, isProd } from '~util/env';

/**
 * 获取当前环境是否是dev开发模式 (永远与useIsProd互斥)
 * @example
 *
 *  const dev = useIsDev();
 *  if (dev) {
 *    console.log('dev');
 *  }
 *
 */
export const useIsDev = isDev;

/**
 *
 * 获取当前环境是否是prod生产模式
 * @example
 *
 *  const prod = useIsProd();
 *  if (prod) {
 *    console.log('prod');
 *  }
 */
export const useIsProd = isProd;
