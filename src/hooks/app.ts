import { createApp } from 'h3';
import { startServer } from '../core/server';
import { implementApi } from '../core/api';
import { addPlugin } from '../core/plugin';

// 新建一个h3实例
const app = createApp();

// 创建sword app
export const useApp = () => {
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return {
    plugin: {
      add: addPlugin
    },
    server: {
      start: () => startServer(app),
      implementApi: () => implementApi(app)
    }
  };
};
