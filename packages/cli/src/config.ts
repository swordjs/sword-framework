import { loadConfig } from 'unconfig';
import type { CommandConfig } from '../../../typings/config';

export let configData: CommandConfig;

// 默认配置的类型是非必选的config
const defaultConfig: Required<CommandConfig> = {
  platform: 'server'
};

export const initConfig = async () => {
  const { config } = await loadConfig<CommandConfig>({
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
  // 遍历defaultConfig，如果config没有传入某个配置，则使用defaultConfig中的内容
  let key: keyof typeof defaultConfig;
  for (key in defaultConfig) {
    if (!config[key]) {
      config[key] = defaultConfig[key];
    }
  }
  configData = config;
};

export type { CommandConfig } from '../../../typings/config';
