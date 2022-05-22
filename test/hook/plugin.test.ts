import { describe, it, expect } from 'vitest';
import { usePlugin } from '../../src/hooks/plugin';
import { aggregatePluginBehavior, plugins } from '../../src/core/plugin';
import type { Plugin } from '../../typings/index';

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
        },
        success: (val: string) => {
          console.log(val);
        },
        err: (val: string | Error) => {
          console.log(val);
        }
      }
    };
    plugin.add(plugin1);
    const behavior = aggregatePluginBehavior();
    expect(Object.keys(behavior)).toEqual(['log', 'server']);
  });

  it('preset plugins', () => {
    console.log(plugins);
  });
});
