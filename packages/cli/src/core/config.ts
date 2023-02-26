import { cwd } from 'process';
import { loadConfig } from 'unconfig';
import { getPackageJson } from '~util/package';
import type { Config } from '../../typings/config';

export let configData: Required<Config>;

const packageData = getPackageJson();

// 默认配置的类型是非必选的config
const defaultConfig: Config = {
  share: {
    dirName: 'share',
    path: cwd(),
    type: {
      dirName: 'type',
      package: {
        name: `${packageData?.package.name}-type`,
        version: packageData?.package.version,
        description: `${packageData?.package.name}-type`
      }
    }
  },
  language: 'EN'
};

export const initConfig = async () => {
  const { config } = await loadConfig<Config>({
    sources: [
      {
        files: 'sword.config',
        // default extensions
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']
      },
      {
        files: 'package.json',
        extensions: [],
        rewrite(config: any) {
          return config?.sword;
        }
      }
    ],
    merge: false
  });
  if (typeof config === 'undefined') return defaultConfig;
  // 合并对象
  configData = mergeConfig(config, defaultConfig) as any;
  return configData;
};

// 递归遍历defaultConfig, 如果config中没有某个配置, 则使用defaultConfig中的配置
const mergeConfig = (config: Config, defaultConfig: Config) => {
  let key: keyof typeof config;
  for (key in defaultConfig) {
    // 如果配置中存在一个对象, 则递归遍历
    if (typeof defaultConfig[key] === 'object' && config[key]) {
      config[key] = mergeConfig(config[key] as any, defaultConfig[key] as any) as any;
    } else {
      config[key] = defaultConfig[key] as any;
    }
  }
  return config;
};

export type { Config } from '../../typings/config';
