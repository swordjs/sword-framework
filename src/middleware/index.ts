import type { PipelineNode, PipelineNodeReturn } from '../../typings/middleware';

export const preApiCallPipeline: PipelineNode<any>[] = [];
export const postApiCallPipeline: PipelineNode<any>[] = [];

// 推送到队列中
const push =
  <T>(cb: PipelineNode<T>) =>
  (pipeline: PipelineNode<any>[]) => {
    pipeline.push(cb);
    return cb;
  };

// 执行队列
export const exec =
  <T>(input: T) =>
  async (pipeline: PipelineNode<any>[]) => {
    let res = input;
    for (let i = 0; i < pipeline.length; i++) {
      try {
        res = await pipeline[i](res);
      } catch (error) {
        return new Error('pipeline eror');
      }
      if (res === undefined || res === null) {
        return res;
      }
    }
    return res;
  };

/**
 *
 * @name 使用PreApiCall管道
 * @description
 * 可以给`usePreApiCallPipeline`传递一个类型T，代表了管道流通的数据类型，
 * 在`push`这个方法中也可以传递一个T的子类型，参数为一个可异步也可同步的cb，
 * 而`exec`方法则就是执行队列中存储的cb，如果遇到null|undefined则就会立即停止
 * 执行。
 * @example
 *  const pipeline = usePreApiCallPipeline();
 *  pipeline.push(() => {
 *     console.log("管道1")
 *  })
 *  pipeline.push(async () => {
 *     console.log("管道2")
 *  })
 *  pipeline.exec({default: "message"})
 * @template T
 * @return {*}  {{
 *   push: <K extends T>(cb: PipelineNode<K>) => void;
 * }}
 */
export const usePreApiCallPipeline = <T>(): {
  push: <K extends T>(cb: PipelineNode<K>) => PipelineNode<K>;
} => {
  return {
    push: (cb) => {
      return push(cb)(preApiCallPipeline);
    }
  };
};

/**
 *
 * @name 使用PostApiCall管道
 * @description
 * 可以给`usePostApiCallPipeline`传递一个类型T，代表了管道流通的数据类型，
 * 在`push`这个方法中也可以传递一个T的子类型，参数为一个可异步也可同步的cb，
 * 而`exec`方法则就是执行队列中存储的cb，如果遇到null|undefined则就会立即停止
 * 执行。
 * @example
 *  const pipeline = usePostApiCallPipeline();
 *  pipeline.push(() => {
 *     console.log("管道1")
 *  })
 *  pipeline.push(async () => {
 *     console.log("管道2")
 *  })
 *  pipeline.exec({default: "message"})
 * @template T
 * @return {*}  {{
 *   push: <K extends T>(cb: PipelineNode<K>) => void;
 * }}
 */
export const usePostApiCallPipeline = <T>(): {
  push: <K extends T>(cb: PipelineNode<K>) => PipelineNode<K>;
} => {
  return {
    push: (cb) => {
      return push(cb)(postApiCallPipeline);
    }
  };
};
