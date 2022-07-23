import { useApi, Get, Post } from '../../packages/runtime/src/hooks';
import { describe, it, expect } from 'vitest';

describe('useApi', () => {
  it('不传递指示器', () => {
    const res = useApi({
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect([...(res.instruct.get(undefined)?.methods || [])]).toEqual(['GET']);
  });
  it('传递单个指示器，不传入任何参数', () => {
    const res = useApi({
      instruct: Get(),
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect([...(res.instruct.get(undefined)?.methods || [])]).toEqual(['GET']);
  });
  it('传递单个指示器，传入/', () => {
    const res = useApi({
      instruct: Get('/'),
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect([...(res.instruct.get(undefined)?.methods || [])]).toEqual(['GET']);
  });
  it('传递单个指示器，传入参数', () => {
    const res = useApi({
      instruct: Get('/yes'),
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct.get('/yes')).toEqual({
      methods: new Set(['GET']),
      type: 'mandatory'
    });
  });
  it('传递多个指示器，只传递空数组', () => {
    const res = useApi({
      instruct: [],
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect([...(res.instruct.get(undefined)?.methods || [])]).toEqual(['GET']);
  });
  it('传递多个指示器', () => {
    const res = useApi({
      instruct: [Get('/'), Post('/detail'), Post()],
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct.get(undefined)).toEqual({
      methods: new Set(['GET', 'POST']),
      type: 'file-system'
    });
    expect(res.instruct.get('/detail')).toEqual({
      methods: new Set(['POST']),
      type: 'mandatory'
    });
  });
  it('传递多个指示器，首个非法值，剩下的随机值', () => {
    const res = useApi({
      instruct: [Get('/'), Post('/detail'), Post()],
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct.get(undefined)).toEqual({
      methods: new Set(['GET', 'POST']),
      type: 'file-system'
    });
  });
  it('传递一个指示器到数组中，并且不设置url', () => {
    const res = useApi({
      instruct: [Post()],
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct.get(undefined)).toEqual({
      methods: new Set(['POST']),
      type: 'file-system'
    });
  });
});

describe('useApi-customReturn', () => {
  it('不传递header', async () => {
    const res = useApi({
      instruct: [Get()],
      handler: async () => {
        return () => {
          return {
            statusMessage: 'ok',
            statusCode: 200,
            data: {
              message: 'hello'
            }
          };
        };
      }
    });
    const handlerResult = (await (res as any).handler())();
    expect(handlerResult).toEqual({ statusMessage: 'ok', statusCode: 200, data: { message: 'hello' } });
  });
});
