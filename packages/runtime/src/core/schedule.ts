import { commandArgs } from '~util/config';
import type { CommandConfig } from '~types/config';

// 支持异步加载依赖的列表
const asyncDependencyList = ['@swordjs/h3', '@swordjs/sword-plugin-log', '@swordjs/sword-plugin-server', '@swordjs/sword-plugin-unicloud-log'] as const;

// 配置一个缓存对象
const asyncDependencyCache: Record<
  typeof asyncDependencyList[number],
  {
    platforms: CommandConfig['platform'][];
    module: any;
  }
> = {
  '@swordjs/h3': {
    platforms: ['server'],
    module: undefined
  },
  '@swordjs/sword-plugin-log': {
    platforms: ['server'],
    module: undefined
  },
  '@swordjs/sword-plugin-server': {
    platforms: ['server'],
    module: undefined
  },
  '@swordjs/sword-plugin-unicloud-log': {
    platforms: ['unicloud'],
    module: undefined
  }
};

/**
 * 导入异步依赖 (根据运行时环境, 如果运行时环境不符合, 则返回null)
 * @param {typeof asyncDependencyList[number]} dependency
 * @return {*}  {(Promise<(() => unknown) | null>)}
 */
const importAsyncDependency = async (dependency: typeof asyncDependencyList[number]): Promise<(() => unknown) | null> => {
  // 如果platforms中有当前运行时环境, 则异步加载
  if (asyncDependencyCache[dependency].platforms.includes(commandArgs.platform)) {
    try {
      const result = await import(dependency);
      asyncDependencyCache[dependency].module = result;
      return result;
    } catch (error) {
      // 如果加载失败, 就抛出错误
      throw error;
    }
  }
  return null;
};

/**
 *
 * 根据不同的运行时环境, 让依赖实现异步加载, 即异步依赖调度器
 * @return {*}  {Promise<void>}
 */
export const asyncDependencyScheduler = async (): Promise<void> => {
  let key: keyof typeof asyncDependencyCache;
  for (key in asyncDependencyCache) {
    if (asyncDependencyCache[key].module) {
      continue;
    }
    await importAsyncDependency(key);
  }
};

/**
 *
 * 异步获取依赖
 * @param {typeof asyncDependencyList[number]} dependency
 * @return {*}
 */
export const getAsyncDependency = <T = any>(dependency: typeof asyncDependencyList[number]): T => {
  return asyncDependencyCache[dependency]['module'] as never as T;
};
