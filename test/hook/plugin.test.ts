import { describe, it, expect } from 'vitest';
import { usePlugin } from '../../packages/runtime/src/hooks/plugin';
import { aggregatePluginBehavior, plugins } from '../../packages/runtime/src/core/plugin';
import { asyncDependencyScheduler } from '../../packages/runtime/src/core/schedule';
import type { Plugin } from '../../typings/index';

describe('plugin', async () => {
  await asyncDependencyScheduler();
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
  it('aggregatePluginBehavior', async () => {
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
    const behavior = await aggregatePluginBehavior();
    expect(Object.keys(behavior)).toEqual(['log', 'server']);
  });
});
