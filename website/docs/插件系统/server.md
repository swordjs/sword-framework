---
title: server
url: https://www.yuque.com/mlgrgm/lrf0ra/wcvo10
---

sword在server端的实现，是使用插件实现的，我们可以在这里实现一个server插件，并且注册到server root节点上。

```typescript
import { createServer } from 'http';
import net from 'net';
import { log } from '@swordjs/sword-plugin-log';
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
    server.on('listening', function () {
      server.close();
      resolve(port);
    });
    server.on('error', function (err: any) {
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

```

我们导出了一个函数名为useServer，我们就可以在server中直接使用，在这里只是一个demo，因为sword内置已经支持了这个插件，现在我们可以使用server插件

```typescript
const plugin = usePlugin();

plugin.add(useServer);
```

<a name="p5dV3"></a>

## 类型

```typescript
server?: {
  start: (...args: any[]) => Promise<void> | void;
};
```
