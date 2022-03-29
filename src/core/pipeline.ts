import type { PipelineNode } from '../../typings/pipeline';
import type { HttpContext } from '@sword-code-practice/types/sword-backend-framework';

export type PipelineTypeKeys = 'preApiCall' | 'postApiCall';

export const pipelineMap: Record<PipelineTypeKeys, PipelineNode<any>[]> = {
  preApiCall: [],
  postApiCall: []
};

// 推送到队列中
export const push =
  <T>(cb: PipelineNode<T>) =>
  (pipeline: PipelineNode<any>[]) => {
    pipeline.push(cb);
    return cb;
  };

/**
 * 执行队列
 * @description
 * exec内部维护了一个数组，保存了每一个pipeline的返回值它们类型默认是T，但是pipeline也会返回undefined
 * 或者null值，内部对于undefined和null值会返回一个[null, 上一个pipeline返回值]
 * 在用户显式地返回了带有return的对象时，则exec函数就会返回这个return对象
 * 综上exec的返回值可能是error ｜ 也可能是正常的T ｜ 也可能是一个数组 | 也可能返回一个对象return
 * @template T
 * @param {T} input
 */
export const exec = async <T extends HttpContext>(
  type: PipelineTypeKeys,
  input: T
): Promise<Error | T | [null, T] | Record<'return', HttpContext['return']>> => {
  const res = [input];
  for (let i = 0; i < pipelineMap[type].length; i++) {
    const last = res[res.length - 1];
    try {
      res.push(await pipelineMap[type][i](typeof last === 'object' ? JSON.parse(JSON.stringify(last)) : last));
    } catch (error) {
      return new Error(`pipeline ${type} error`);
    }
    const current = res[res.length - 1];
    // console.log(current);
    if (current && current.return) {
      return {
        return: current.return
      };
    } else if (current === undefined || current === null) {
      return [null, last];
    }
  }
  return res[res.length - 1];
};
