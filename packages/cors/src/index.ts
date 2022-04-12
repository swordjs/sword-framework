import type { HttpContext, Plugin } from '../../../typings/index';

// 定义默认的返回context值
const defaultResHeaders: Partial<HttpContext['resHeaders']> = {
  'Access-Control-Allow-Origin': '*'
};
/**
 * 定义cors插件
 * @preset true
 * @return {*}
 */
export const useCorsPlugin = (resHeaders = defaultResHeaders): Plugin => {
  return {
    name: 'cors',
    context: (ctx) => {
      ctx = {
        ...ctx,
        resHeaders
      };
      return ctx;
    }
  };
};
