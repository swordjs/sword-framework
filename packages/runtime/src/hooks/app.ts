import { commandArgs } from '../../../../util/config';
import { aggregatePluginBehavior } from '../core/plugin';
import { implementApi } from '../core/api';
import { asyncDependencyScheduler, getAsyncDependency } from '../core/schedule';
import type H3 from '@sword-code-practice/h3';

/**
 *
 * 创建sword app
 * @description 返回一个app实例，在实例中你可以使用挂载在实例上的方法，比如`implementApi`
 * @example
 * import { useApp } from "@sword-code-practice/backend-framework";
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
  // 异步加载与运行时环境的异步依赖
  await asyncDependencyScheduler();
  // 初始化返回
  const returnData: AppReturn = {
    implementApi: () => implementApi(app),
    server: {
      // 这里默认返回useapp对象. 因为为了抹平各端的差异, 在各端都需要实现start函数, 如果是server环境就是启动服务器
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      start: () => {}
    }
  };
  // 新建一个h3实例
  let app: H3.App | null = null;
  if (['server'].includes(commandArgs.platform)) {
    const h3 = await getAsyncDependency<typeof H3>('@sword-code-practice/h3');
    app = h3.createApp();
    returnData.server.start = () => {
      if (aggregatePlugin.server.plugin.start) aggregatePlugin.server.plugin.start(app);
    };
  }
  // 整合插件
  const aggregatePlugin = aggregatePluginBehavior();
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return returnData;
};
