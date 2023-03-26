import { resolve } from 'path';
import { platformHook } from '../core/platform';
import { aggregatePluginBehavior } from '../core/plugin';
import { implementApi } from '../core/api';
import { asyncDependencyScheduler, getAsyncDependency } from '../core/schedule';
import { env } from '#types/env';
import type { Config } from '@cli/core/config';
import type * as H3 from '@swordjs/h3';

/**
 *
 * 创建sword app
 * @description 返回一个app实例，在实例中你可以使用挂载在实例上的方法，比如`implementApi`
 * @example
 * import { useApp } from "@swordjs/backend-framework";
 * const app = useApp();
 * const init = async () => {
 *  app.implementApi();
 * };
 * init()
 * @return {*}
 */
type AppReturn = {
  implementApi: () => Promise<void>;
  server: {
    start: () => void;
  };
};
export const useApp = async (): Promise<AppReturn> => {
  // 初始化返回
  const returnData: AppReturn = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    implementApi: (() => {}) as any,
    server: {
      // 这里默认返回useapp对象. 因为为了抹平各端的差异, 在各端都需要实现start函数, 如果是server环境就是启动服务器
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      start: () => {}
    }
  };
  // 新建一个h3实例
  let app: H3.App | null = null;

  await platformHook({
    server: async () => {
      // 尝试加载.shim文件夹中的process.js文件，因为运行时可能需要加载shim/process，但是在dev环境下，由于是sword cli运行程序，所以不需要加载；但是build之后独立于cli运行，所以需要加载
      try {
        await import(resolve('./.shim/process.js'));
      } catch (e) {}
      // 异步加载与运行时环境的异步依赖
      await asyncDependencyScheduler();
      const aggregatePlugin = await aggregatePluginBehavior();
      const h3 = await getAsyncDependency<typeof H3>('@swordjs/h3');
      app = h3.createApp();
      returnData.server.start = () => {
        if (aggregatePlugin.server.plugin.start)
          aggregatePlugin.server.plugin.start(app, {
            port: (JSON.parse(process.env[env['swordConfig']] as string) as Config).server?.port
          });
      };
      returnData.implementApi = () => implementApi(app);
    }
  });
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return returnData;
};
