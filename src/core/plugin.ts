import type { Plugin } from '@sword-code-practice/types/sword-backend-framework';

export const plugins = new Map();

export const addPlugin = (plugin: Plugin): Map<string, Plugin> => {
  plugins.set(plugin.name, plugin);
  return plugins;
};
