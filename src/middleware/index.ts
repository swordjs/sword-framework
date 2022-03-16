import type { PipelineNode } from '../../typings/middleware';
import type { HttpContext } from '@sword-code-practice/types/sword-backend-framework';

type PipelineTypeKeys = 'preApiCall' | 'postApiCall';

export const pipelineMap: Record<PipelineTypeKeys, PipelineNode<any>[]> = {
  preApiCall: [],
  postApiCall: []
};

// 推送到队列中
const push =
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
      res.push(await pipelineMap[type][i](last));
    } catch (error) {
      return new Error(`pipeline ${type} error`);
    }
    if (last === undefined || last === null) {
      return [null, last];
    } else if (last.return) {
      return {
        return: last.return
      };
    }
  }
  return res[res.length - 1];
};

/**
 *
 * @name 使用管道
 * @description
 * 可以给`usePipeline`传递一个类型T，代表了管道流通的数据类型，
 * 在usePipeline这个函数中，第一个参数为pipeline类型，第二个参数为一个可异步也可同步的cb，
 * pipeline内部有一个`exec`方法就是顺序执行队列中存储的cb，如果遇到cb返回值为null|undefined则就会立即停止执行。
 * @example
 *  const pipeline = usePipeline();
 *
 *  pipeline('preApiCall', (v) => {
 *    return v;
 *  })
 * @template T
 */
export const usePipeline =
  <T extends HttpContext>() =>
  (type: PipelineTypeKeys, cb: PipelineNode<T>) => {
    push(cb)(pipelineMap[type]);
  };
