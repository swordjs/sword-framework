import { createServer } from 'http';
import net from 'net';
import { log } from '@sword-code-practice/sword-plugin-log';
import type { Plugin } from '../../../typings/index';

type ServerConfig = {
  port?: number;
};

const defaultServerConfig: ServerConfig = {
  port: 3000
};

/**
 * 开启服务器
 * @platform web
 * @param {App} app
 * @param {ServerConfig} [serverConfig=defaultServerConfig]
 */
const startServer = async (app: any, serverConfig: ServerConfig = defaultServerConfig): Promise<void> => {
  let key: keyof ServerConfig;
  for (key in serverConfig) {
    if (!serverConfig[key]) {
      serverConfig[key] = defaultServerConfig[key];
    }
  }

  // 启动服务器
  const start = () => {
    log.info(`HTTP服务启动中...`);
    const server = createServer(app);
    try {
      // 判断
      server.listen(serverConfig.port);
      log.success(`程序运行在${serverConfig.port}端口上`);
    } catch (error) {
      log.err(JSON.stringify(error));
    }
  };

  // 尝试检测port被占用情况
  const tryUsePort = async (): Promise<any> => {
    // 查看端口是否占用
    const used = await portUsed(serverConfig.port as number);
    if (used === false) {
      // 如果端口被占用，就把port++
      serverConfig.port && serverConfig.port++;
      return await tryUsePort();
    } else {
      // 没有被占用返回true
      return true;
    }
  };

  if (await tryUsePort()) {
    // port合法
    start();
  }
};

// 端口是否使用
const portUsed = (port: number): Promise<number | false> => {
  return new Promise((resolve) => {
    const server = net.createServer().listen(port);
    server.on('listening', () => {
      server.close();
      resolve(port);
    });
    server.on('error', (err: any) => {
      if (err.code == 'EADDRINUSE') {
        resolve(false);
      }
    });
  });
};

export const useServer = (): Plugin => {
  return {
    name: 'server',
    server: {
      start: startServer
    }
  };
};
