import { describe, it, expect } from 'vitest';
import { useCorsPlugin } from '../src/index';

describe('cors', () => {
  it('should work', () => {
    const context = useCorsPlugin();
    expect(context.context({} as any)).toEqual({
      resHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  });
  it('should work - into context', () => {
    const context = useCorsPlugin({
      'Access-Control-Allow-Origin': 'https://www.baidu.com'
    });
    expect(context.context({} as any)).toEqual({
      resHeaders: {
        'Access-Control-Allow-Origin': 'https://www.baidu.com'
      }
    });
  });
});
