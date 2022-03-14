import { usePostApiCallPipeline, usePreApiCallPipeline, exec, preApiCallPipeline, postApiCallPipeline } from '../../src/middleware';

describe('usePostApiCallPipeline', () => {
  it('同步和异步方法混合', () => {
    type Msg = {
      data: string;
    };
    const pipeline = usePostApiCallPipeline<Msg>();
    const defaultData: Msg = {
      data: 'default'
    };
    pipeline.push((e: Msg) => {
      expect(e).toBe({ data: 'default' });
      return {
        data: '我是节点1'
      };
    });

    pipeline.push((e: Msg) => {
      expect(e).toBe({ data: '我是节点1' });
      return {
        data: '我是节点2'
      };
    });
    exec(defaultData)(postApiCallPipeline);
  });
});

describe('usePreApiCallPipeline', () => {
  it('同步和异步方法混合', () => {
    type Msg = {
      data: string;
    };
    const pipeline = usePreApiCallPipeline<Msg>();
    const defaultData: Msg = {
      data: 'default'
    };
    pipeline.push((e: Msg) => {
      expect(e).toBe({ data: 'default' });
      return {
        data: '我是节点1'
      };
    });

    pipeline.push((e: Msg) => {
      expect(e).toBe({ data: '我是节点1' });
      return {
        data: '我是节点2'
      };
    });
    exec(defaultData)(preApiCallPipeline);
  });
});
