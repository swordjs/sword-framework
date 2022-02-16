// HTTP 触发器
export const Get = (path?: string) => {
  return {
    method: 'get'
  };
};

export const Post = (path?: string) => {
  return {
    method: 'post'
  };
};

// 创建API
export const Api = () => {};
