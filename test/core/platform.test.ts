import { describe, it, expect } from 'vitest';
import { adaptEvent } from '../../packages/runtime/src/core/api';
import type { UnicloudEvent } from '../../typings/unicloud';

describe('transform-event', () => {
  it('a full event object', async () => {
    process.env.platform = 'unicloud';

    const event: UnicloudEvent = {
      route: '/test/test',
      method: 'POST',
      params: {},
      query: {}
    };
    const result = await adaptEvent(event);
    expect(result).toEqual({
      req: event,
      res: null,
      key: event.route,
      method: event.method,
      params: event.params,
      query: event.query
    });
  });
});
