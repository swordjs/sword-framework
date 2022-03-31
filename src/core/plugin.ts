import { useLogPlugin } from '@sword-code-practice/sword-plugin-log';
import { useServer } from '@sword-code-practice/sword-plugin-server';
import type { Plugin } from '@sword-code-practice/types/sword-backend-framework';

export const plugins: Plugin[] = [];

let aggregatePlugin: AggregatePlugin | null = null as any;

/**
 *
 * 添加plugin插件
 * @param {(Plugin | (() => Plugin))} plugin
 * @return {*}  {Promise<Plugin[]>}
 */
export const addPlugin = async (plugin: Plugin | (() => Plugin)): Promise<Plugin[]> => {
  let _plugin: Plugin = plugin;
  // 判断plugin是否是函数
  if (typeof plugin === 'function') {
    _plugin = plugin();
  }
  plugins.push(_plugin);
  return plugins;
};

type AggregatePlugin = Record<Exclude<keyof Plugin, 'name'>, { name: string; plugin: any }>;
/**
 *
 * 处理插件核心，返回一个聚合插件，方便shim到程序中
 * @description 我们需要这个函数去帮助我们做一些事情，就是把已知的插件聚合到一起，为什么要聚合，因为我们需要把插件的接口都暴露出去，这样我们就可以在程序中使用这些插件的接口了
 * 而一个插件是可以实现多root的，即一个插件并不是颗粒度细腻的，你甚至可以用插件来实现全部的root，但是我们如果注册了多个插件，就需要去聚合，新的替换旧的，这也是生存法则。
 * 我们的数据结构是这样的：
 * 每一个root有且只有一个实现函数
 * 聚合插件对象中的key就是我们的root，即server,log等等
 * 聚合插件对象中的value就是一个对象，对象的key（name）是插件名称，plugin是插件的实现
 * 而由于我们是多root的插件，所以在获取plugin的时候，我们会自动获取同root的实现
 * @example
 * // 比如我新增了一个插件
 * addPlugin(() => {
 *  name: "new-plugin",
 *  log: {
 *    success: () => {}
 *  }
 * })
 *
 * // 那此时的聚合插件就是这样的
 * const aggregatePlugin = {
 *  log: {
 *    name: "new-plugin",
 *    plugin: {
 *      success () => {}
 *    }
 *  }
 * }
 *
 * @return {*}  {Record<string, unknown>}
 */
export const aggregatePluginBehavior = (): AggregatePlugin => {
  if (aggregatePlugin === null) {
    // 设置一个默认空对象
    aggregatePlugin = {} as any;
    // 处理plugin数组
    for (const i in plugins) {
      const plugin = plugins[i];
      let key: keyof Plugin;
      for (key in plugin) {
        // 聚合不需要把name也聚合进去
        if (key !== 'name') {
          // 循环plugin下的每一个节点,将所有插件的行为递归聚合到aggregatePlugin中，可以调用一个方法
          // 这个数据结构每个root根节点之下，都保存了一个对象，key就是声明此root功能的插件名称，它的值则是插件核心
          aggregatePlugin![key] = { name: plugin.name, plugin: plugin[key] as any };
        }
      }
    }
    // 如果聚合后的插件对象有空缺，那么就用预设插件顶替，比如说log，server...
    // 可以进行预设的插件内容
    const presetPlugin: Record<Exclude<keyof Plugin, 'name'>, any> = {
      server: useServer(),
      log: useLogPlugin()
    };
    // 迭代聚合后的插件对象，如果没有聚合的插件，那么就用预设插件顶替
    // 迭代预设插件对象
    let presetKey: Exclude<keyof Plugin, 'name'>;
    for (presetKey in presetPlugin) {
      const currentPlugin = presetPlugin[presetKey];
      // 如果不存在且预设的key也符合要求
      if (!aggregatePlugin![presetKey]) {
        aggregatePlugin![presetKey] = { name: presetKey, plugin: currentPlugin[presetKey] };
      }
    }
  }
  return aggregatePlugin as AggregatePlugin; // 可以强制设置类型，因为此时的聚合对象不再是null或者undefined
};
