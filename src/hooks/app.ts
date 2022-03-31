import { createApp } from 'h3';
import { aggregatePluginBehavior } from '../core/plugin';
import { implementApi } from '../core/api';

// 新建一个h3实例
const app = createApp();

/**
 *
 * 创建sword app
 * @description 返回一个app实例，在实例中你可以使用挂载在实例上的方法，比如`implementApi`
 * @example
 * import { useApp } from "@sword-code-practice/backend-framework";
 * const app = useApp();
 * const init = async () => {
 *  app.server.implementApi();
 * };
 * init()
 * @return {*}
 */
export const useApp = () => {
  // 整合插件
  const aggregatePlugin = aggregatePluginBehavior();
  // 返回app对象,并且返回一些实例，比如说启动http服务以及实现api
  return {
    server: {
      start: () => {
        if (aggregatePlugin.server.plugin.start) aggregatePlugin.server.plugin.start(app);
      },
      implementApi: () => implementApi(app)
    }
  };
};
