import type { HttpApi } from '../../typings/hook/index';

// 创建API
export const Api: HttpApi = (instruct, handler) => {
  return {
    instruct
  };
};
