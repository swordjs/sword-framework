import { exec } from '../../src/core/pipeline';
import { usePipeline } from '../../src/hooks/pipeline';
import { describe, it, expect } from 'vitest';

const pipeline = usePipeline<any>();

describe('PostApiCallPipeline', () => {
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

// 关于返回值的测试，我们需要把测试项单独测试，否则测试项runtime结果会冲突，会导致其他测试项因为前几个测试项停止中间件
describe('PreApiCallPipeline-返回值', () => {
  it('中间件返回null,undefined，不仅会阻止其他中间件，还会返回一个数组', async () => {
    const defaultData = {
      data: 'default'
    };
    pipeline('preApiCall', (e: any) => {
      return {
        data: '111'
      };
    });
    pipeline('preApiCall', (e: any) => {
      console.log('嗯哼，我不返回任何值');
    });
    // 停止
    pipeline('preApiCall', (e: any) => {
      console.log('不会进入这个中间件');
    });
    const result = await exec<any>('preApiCall', defaultData);
    expect(result).toStrictEqual([
      null,
      {
        data: '111'
      }
    ]);
  });
  // it('中间件返回return对象，不仅阻止其他中间件，还会直接返回return对象', async () => {
  //   const defaultData = {
  //     data: 'default'
  //   };
  //   pipeline('preApiCall', (e: any) => {
  //     return {
  //       data: '111'
  //     };
  //   });
  //   pipeline('preApiCall', (e: any) => {
  //     return {
  //       return: {
  //         data: 'foo and bar'
  //       }
  //     };
  //   });
  //   // 停止
  //   pipeline('preApiCall', (e: any) => {
  //     console.log('不会进入这个中间件');
  //   });
  //   const result = await exec<any>('preApiCall', defaultData);
  //   expect(result).toStrictEqual({
  //     return: {
  //       data: 'foo and bar'
  //     }
  //   });
  // });
  // it('制造一个error，阻止以后的中间件执行', async () => {
  //   const defaultData = {
  //     data: 'default'
  //   };
  //   pipeline('preApiCall', (e: any) => {
  //     throw new Error('a error');
  //   });
  //   // 停止执行后面的中间件
  //   pipeline('preApiCall', (e: any) => {
  //     console.log('不会进入这个中间件');
  //     return {
  //       data: '我是节点2'
  //     };
  //   });
  //   const result = await exec<any>('preApiCall', defaultData);
  //   expect(result).toBeInstanceOf(Error);
  // });
});

describe('PreApiCallPipeline', () => {
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
