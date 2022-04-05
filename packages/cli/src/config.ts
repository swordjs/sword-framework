// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { loadConfig } from 'unconfig';
import type { Config } from '../typings/config';

// 默认配置的类型是非必选的config
const defaultConfig: Required<Config> = {};

export const getConfig = async () => {
  const { config } = await loadConfig<Config>({
    sources: [
      {
        files: 'sword.config',
        // default extensions
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']
      },
      // load `my` field in `package.json` if no above config files found
      {
        files: 'package.json',
        extensions: [],
        rewrite(config) {
          return config?.sword;
        }
      }
    ],
    // if false, the only the first matched will be loaded
    // if true, all matched will be loaded and deep merged
    merge: false
  });
  if (typeof config === 'undefined') return defaultConfig;
  // 遍历defaultConfig，如果config没有传入某个配置，则使用defaultConfig中的内容
  for (const key in defaultConfig) {
    if (!config[key]) {
      config[key] = defaultConfig[key];
    }
  }
  return config as Required<Config>;
};

export type { Config } from '../typings/config';
