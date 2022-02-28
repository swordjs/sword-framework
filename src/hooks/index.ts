import type { HttpApi, HttpInstructMethod } from '../../typings/hook/index';

// 创建API
export const useApi: HttpApi = (instruct, handler) => {
  // 对指示器做一下输出处理，避免编译器做过多逻辑
  let path;
  let method: HttpInstructMethod[] = [];
  // 如果传递了多个指示器
  if (Array.isArray(instruct)) {
    if (instruct.length === 0) {
      // 如果传入了一个空数组，就默认给一个method
      method.push('get');
    } else {
      // 取出method，并且进行去重复
      method = [...new Set(instruct.map(i => i.method))]
      // 获取队列中除去为null/undefined的第一个有效path
      const result = instruct.filter((i) => i.path && i.path.trim() !== '');
      if (result.length > 0) {
        // 如果存在有效的path就赋值
        path = result[0].path;
      }
    }
  } else {
    // 如果仅仅传入了一个指示器，那么直接对method和path做处理
    method.push(instruct.method);
    if (instruct.path && instruct.path.trim() !== '') path = instruct.path;
  }
  return {
    instruct: {
      method,
      path
    },
    handler
  };
};

export * from './instruct';
