import { describe, it, expect } from 'vitest';
import { usePlugin } from '../../src/hooks/plugin';
import { aggregatePluginBehavior, plugins } from '../../src/core/plugin';
import type { Plugin } from '@sword-code-practice/types/sword-backend-framework';

describe('plugin', () => {
  const plugin = usePlugin();
  // it('addPlugin', () => {
  //   const plugin: Plugin = {
  //     name: 'test'
  //   };
  //   app.plugin.add(plugin);
  //   expect(aggregatePluginBehavior()).toStrictEqual({
  //     name: 'test'
  //   });
  // });
  it('aggregatePluginBehavior', () => {
    const plugin1: Plugin = {
      name: 'test1',
      log: {
        info: (val: string) => {
          console.log(val);
        }
      }
    };
    const plugin2: Plugin = {
      name: 'test2',
      log: {
        success: (val: string) => {
          console.log(val);
        }
      }
    };
    const plugin3: Plugin = {
      name: 'test3',
      server: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        start: () => {}
      },
      log: {
        success: (val: string) => {
          console.log(val);
        }
      }
    };
    plugin.add(plugin1);
    plugin.add(plugin2);
    plugin.add(plugin3);
    const behavior = aggregatePluginBehavior();
    console.log(behavior);
    expect(Object.keys(behavior)).toEqual(['name', 'log', 'server']);
  });

  it('测试预设插件', () => {
    console.log(plugins);
  });
});
