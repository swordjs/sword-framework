import { createServer } from 'http';
import { createApp } from 'h3';
import { implementApi } from '../core/api';
import log from '../log';

// 新建一个h3实例
const app = createApp();

// 创建sword app
export const useApp = () => {
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return {
    server: {
      start: startServer,
      implementApi: (dirName: string) => implementApi(app, dirName)
    }
  };
};

// 启动服务器
const startServer = () => {
  log.info(`HTTP服务启动中...`);
  const server = createServer(app);
  try {
    server.listen(3000);
    log.success(`程序运行在3000端口上`);
  } catch (error) {
    log.err(JSON.stringify(error));
  }
};

export * from './instruct';
export * from './api';
