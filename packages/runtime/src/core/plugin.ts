import { getAsyncDependency } from './schedule';
import { platformHook } from './platform';
import type { Plugin, RegisterOneceRoot } from '#types/index';

export const plugins: Plugin[] = [];

export let aggregatePlugin: AggregatePlugin | null = null;

/**
 *
 * 添加plugin插件
 * @param {(Plugin | (() => Plugin))} plugin
 * @return {*}  {Promise<Plugin[]>}
 */
export const addPlugin = (plugin: Plugin | (() => Plugin)): Plugin[] => {
  let _plugin: Plugin = plugin;
  // 判断plugin是否是函数
  if (typeof plugin === 'function') {
    _plugin = plugin();
  }
  plugins.push(_plugin);
  return plugins;
};

type AggregatePlugin = Record<Exclude<keyof Plugin, 'name'>, { name: string | null; plugin: any | any[] }>;
type PresetPluginKeys = keyof Pick<Plugin, 'server' | 'log'>;

/**
 * 处理预设插件
 * @return {*}  {Record<PresetPluginKeys, any>}
 */
const addPresetPlugin = async (): Promise<Record<PresetPluginKeys, any>> => {
  // 如果聚合后的插件对象有空缺，那么就用预设插件顶替，比如说log，server...
  // 可以进行预设的插件内容
  return {
    server: await platformHook({
      server: () => getAsyncDependency('@swordjs/sword-plugin-server')['useServer'](),
      default: () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return { name: 'server', server: { start: () => {} } };
      }
    }),
    log: await platformHook({
      server: () => getAsyncDependency('@swordjs/sword-plugin-log')['useLog'](),
      unicloud: () => getAsyncDependency('@swordjs/sword-plugin-unicloud-log')['useLog'](),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {}
    })
  };
};

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
export const aggregatePluginBehavior = async (): Promise<AggregatePlugin> => {
  // 插件公开的root节点中, 有要确保唯一性的, 所以即使有多个插件注册了root节点, 最终也只会有一个root节点
  // 比如server, log, unicloud-log等等
  // 所以我们需要把这些root节点进行硬编码
  const registerOneceRoot: RegisterOneceRoot = ['server', 'log', 'context'];
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
          // key是否可以重复注册
          const isOnece = registerOneceRoot.includes(key as any);
          // 循环plugin下的每一个节点,将所有插件的行为递归聚合到aggregatePlugin中，可以调用一个方法
          aggregatePlugin![key] = {
            name: isOnece ? plugin.name : null,
            // 如果允许多次注册的钩子, 那么plugin就是一个数组, 否则就不是一个数组
            plugin: !isOnece ? (aggregatePlugin![key]?.plugin ?? []).concat(plugin[key]) : plugin[key]
          };
        }
      }
    }
    // 处理预设插件
    const presetPlugin = await addPresetPlugin();
    // 迭代聚合后的插件对象，如果没有聚合的插件，那么就用预设插件顶替
    // 迭代预设插件对象
    let presetKey: PresetPluginKeys;
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
