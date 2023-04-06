import { cwd } from 'process';
import { loadConfig } from 'unconfig';
import { getPackageJson } from '~util/package';
import autoImport from '../core/autoImport';
import { loadI18n } from '../i18n/i18n-node';
import { ref } from '@vue/reactivity';
import type { Config } from '../../typings/config';

export const configData = ref<Required<Config>>({} as any);

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
  language: 'en'
};

/**
 *
 * @return {*}
 */
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
  if (typeof config === 'undefined') {
    configData.value = defaultConfig as Required<Config>;
  } else {
    configData.value = mergeConfig(config, defaultConfig);
  }
  await afterInitConfig();
};

/**
 *
 * recursively iterate through defaultConfig, and if there is no configuration in config, use the configuration in defaultConfig
 * @param {Config} config
 * @param {Config} defaultConfig
 * @return {*}  {Required<Config>}
 */
const mergeConfig = (config: Config, defaultConfig: Config): Required<Config> => {
  let key: keyof typeof config;
  for (key in defaultConfig) {
    // If there is an object in the configuration, then recursively traverse
    if (typeof defaultConfig[key] === 'object' && config[key]) {
      config[key] = mergeConfig(config[key] as any, defaultConfig[key] as any) as any;
    } else if (config[key] === undefined) {
      config[key] = defaultConfig[key] as any;
    }
  }
  return config as Required<Config>;
};

const afterInitConfig = async () => {
  // Load i18n
  await loadI18n(configData.value.language);
  // The automatically imported configuration items are initialized in autoImport
  await autoImport();
};

export type { Config } from '../../typings/config';
