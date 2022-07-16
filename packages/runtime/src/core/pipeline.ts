import type { PipelineNode } from '#types/pipeline';
import type { HttpContext } from '#types/index';

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
 *
 * 清空队列对应管道的队列
 * @param {PipelineTypeKeys} type
 */
export const clear = (type: PipelineTypeKeys): void => {
  pipelineMap[type] = [];
};

/**
 * 清空全部管道的队列
 *
 */
export const clearAll = (): void => {
  let key: keyof typeof pipelineMap;
  for (key in pipelineMap) {
    pipelineMap[key] = [];
  }
};

// 中断对象（管道返回）
export type InterruptPipelineResult = { type: 'return' | 'stop'; last: HttpContext; current: HttpContext };
/**
 * 执行队列
 * @description
 * exec内部维护了一个数组，保存了每一个pipeline的返回值它们类型默认是T，但是pipeline也会返回undefined
 * 或者null值，内部对于undefined和null值会返回一个对象（中断对象），对象的type属性为stop，并且附带一个last属性
 * 在用户显式地返回了带有return的对象时，则exec函数就会返回一个对象（中断对象），type属性为return, 附带了一个last属性，并且额外有一个return属性
 * 综上exec的返回值可能是error ｜ 也可能是正常的T ｜ 也可能是一个中断对象
 * @template T
 * @param {T} input
 */
export const exec = async <T extends HttpContext>(type: PipelineTypeKeys, input: T): Promise<Error | T | InterruptPipelineResult> => {
  const res = [input];
  for (let i = 0; i < pipelineMap[type].length; i++) {
    const last = res[res.length - 1];
    try {
      res.push(await pipelineMap[type][i](typeof last === 'object' ? JSON.parse(JSON.stringify(last)) : last));
    } catch (error) {
      return new Error(`pipeline ${type} error`);
    }
    const current = res[res.length - 1];
    // 区分2种情况，一种是中断对象（return, stop），一种是正常的对象（返回ctx）
    if (current && current.return) {
      return {
        type: 'return',
        last,
        current
      };
    } else if (current === undefined || current === null) {
      return {
        type: 'stop',
        last,
        current
      };
    }
  }
  return res[res.length - 1];
};
