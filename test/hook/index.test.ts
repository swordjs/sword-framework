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
    expect(res.instruct.method).toEqual(['GET']);
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
    expect(res.instruct.method).toEqual(['GET']);
  });
  it('传递单个指示器，传入空字符串', () => {
    const res = useApi({
      instruct: Get('/'),
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct.method).toEqual(['GET']);
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
    expect(res.instruct).toEqual({
      method: ['GET'],
      path: '/yes'
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
    expect(res.instruct.method).toEqual(['GET']);
  });
  it('传递多个指示器，首个传值，剩下的随机非法值', () => {
    const res = useApi({
      instruct: [Get('/'), Post('/detail'), Post()],
      handler: async () => {
        return {
          hello: 'message'
        };
      }
    });
    expect(res.instruct).toEqual({
      method: ['GET', 'POST'],
      path: '/'
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
    expect(res.instruct).toEqual({
      method: ['GET', 'POST'],
      path: '/'
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
    expect(res.instruct).toEqual({
      method: ['POST'],
      path: undefined
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
