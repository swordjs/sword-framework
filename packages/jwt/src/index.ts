import { create, verify } from 'njwt';
import type { Plugin, HttpContext } from '~types/index';

export const useJwt = (): Plugin => {
  return {
    name: 'jwt',
    // 注册preAPI钩子
    preApi: (ctx: HttpContext) => {
      return ctx;
    }
  };
};
