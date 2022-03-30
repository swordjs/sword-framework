import type { Plugin } from '@sword-code-practice/types/sword-backend-framework';

export const plugins: Plugin[] = [];

/**
 *
 * 添加plugin插件
 * @param {Plugin} plugin
 * @return {*}  {Plugin[]}
 */
export const addPlugin = (plugin: Plugin): Plugin[] => {
  plugins.push(plugin);
  return plugins;
};

/**
 *
 * 处理插件核心，返回一个聚合插件，方便shim到程序中
 * @return {*}  {Record<string, unknown>}
 */
export const aggregatePluginBehavior = (): Record<string, unknown> => {
  const aggregatePlugin: Record<string, Record<string, unknown>> = {};
  // 处理plugin数组
  for (const i in plugins) {
    const plugin = plugins[i];
    let key: keyof Plugin;
    for (key in plugin) {
      // 循环plugin下的每一个节点,将所有插件的行为递归聚合到aggregatePlugin中，可以调用一个方法
      // 这个数据结构每个root根节点之下，都保存了一个对象，key就是声明此root功能的插件名称，它的值则是插件核心
      aggregatePlugin[key as any] = { [plugin.name]: plugin[key] };
    }
  }
  return aggregatePlugin;
};
