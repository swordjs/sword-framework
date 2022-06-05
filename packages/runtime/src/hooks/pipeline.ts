import { push, pipelineMap } from '../core/pipeline';
import type { PipelineTypeKeys } from '../core/pipeline';
import type { HttpContext } from '../../../../typings/index';
import { PipelineNode } from '../../../../typings/pipeline';

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
  <T extends HttpContext = HttpContext>() =>
  (type: PipelineTypeKeys, cb: PipelineNode<T>): void => {
    push(cb)(pipelineMap[type]);
  };
