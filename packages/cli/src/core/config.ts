import { cwd } from 'process';
import { loadConfig } from 'unconfig';
import { getPackageJson } from '~util/package';
import type { Config } from '../../typings/config';

export let configData: Required<Config>;

const packageData = getPackageJson();

// The type of default configuration is optional config
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
  configData = mergeConfig(config, defaultConfig) as any;
  return configData;
};

// recursively iterate through defaultConfig, and if there is no configuration in config, use the configuration in defaultConfig
const mergeConfig = (config: Config, defaultConfig: Config) => {
  let key: keyof typeof config;
  for (key in defaultConfig) {
    // If there is an object in the configuration, then recursively traverse
    if (typeof defaultConfig[key] === 'object' && config[key]) {
      config[key] = mergeConfig(config[key] as any, defaultConfig[key] as any) as any;
    } else {
      config[key] = defaultConfig[key] as any;
    }
  }
  return config;
};

export type { Config } from '../../typings/config';
