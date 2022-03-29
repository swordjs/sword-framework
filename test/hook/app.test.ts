import { describe, it, expect } from 'vitest';
import { useApp } from '../../src/hooks/app';

describe('plugin', () => {
  const app = useApp();
  it('add-plugin', () => {
    const plugin = {
      name: 'test'
    };
    const plugins = app.plugin.add(plugin);
    expect(plugin.name).toEqual(plugin.name);
  });
});
