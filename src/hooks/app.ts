import { h3Setup, h3 } from '../core/';
import { parseCommandArgs } from '../util/config';
import { aggregatePluginBehavior } from '../core/plugin';
import { implementApi } from '../core/api';
import type { App } from '@sword-code-practice/h3';

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
export const useApp = async () => {
  // 新建一个h3实例
  let app: App | null = null;
  if (['server'].includes(parseCommandArgs().platform)) {
    await h3Setup();
    app = h3.createApp();
  }
  // 整合插件
  const aggregatePlugin = aggregatePluginBehavior();
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return {
    implementApi: () => implementApi(app),
    server: {
      start: () => {
        if (aggregatePlugin.server.plugin.start) aggregatePlugin.server.plugin.start(app);
      }
    }
  };
};
