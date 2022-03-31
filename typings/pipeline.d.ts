export type PipelineNodeReturn<T> = T | null | undefined;
// 每一个节点都是一个函数，可以自由传入参数，但是返回也必须是同样的类型，而且支持同步｜异步返回
export type PipelineNode<T> = (item: T) => PipelineNodeReturn<T> | Promise<PipelineNodeReturn<T>>;
