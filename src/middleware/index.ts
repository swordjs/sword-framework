import type { PipelineNode } from '../../typings/middleware/index';

const pipeline: PipelineNode<any>[] = [];

const push = <T>(cb: PipelineNode<T>) => {
  pipeline.push(cb);
};

const exec = async <T>(input: PipelineNode<T>) => {
  let res = input;
  for (let i = 0; i < pipeline.length; i++) {
    try {
      res = await pipeline[i](res);
    } catch (error) {
      throw new Error('pipeline eror');
    }
    if (res === undefined || res === null) {
      return res;
    }
  }
  return res;
};

export const usePipeline = <T>(): {
  push: <K extends T>(cb: PipelineNode<K>) => void;
  exec: <K extends T>(input: PipelineNode<K>) => Promise<PipelineNode<K>>;
} => {
  return {
    push,
    exec
  };
};
