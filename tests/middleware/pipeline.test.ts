import { usePipeline, exec } from '../../src/middleware';

const pipeline = usePipeline<any>();

describe('usePostApiCallPipeline', () => {
  it('同步和异步方法混合', () => {
    const defaultData: any = {
      data: 'default'
    };
    pipeline('postApiCall', (e: any) => {
      expect(e).toBe({ data: 'default' });
      return {
        data: '我是节点1'
      };
    });
    pipeline('postApiCall', (e: any) => {
      expect(e).toBe({ data: '我是节点1' });
      return {
        data: '我是节点2'
      };
    });
    exec<any>('postApiCall', defaultData);
  });
});

describe('usePreApiCallPipeline', () => {
  it('同步和异步方法混合', () => {
    const defaultData = {
      data: 'default'
    };
    pipeline('preApiCall', (e: any) => {
      expect(e).toBe({ data: 'default' });
      return {
        data: '我是节点1'
      };
    });

    pipeline('preApiCall', (e: any) => {
      expect(e).toBe({ data: '我是节点1' });
      return {
        data: '我是节点2'
      };
    });
    exec<any>('preApiCall', defaultData);
  });
});
