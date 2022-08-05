import './pipeline';
import './hook';
import type { LogType } from './log';
import type { UnicloudEvent } from './unicloud';
import type * as H3 from '@swordjs/h3';

export type UnPromisify<T> = T extends Promise<infer U> ? U : T;

export type Event = H3.CompatibilityEvent | UnicloudEvent;

export interface ContextData {
  query?: unknown;
  params?: unknown;
  res?: unknown;
}
export interface HttpContext<T extends ContextData = ContextData> {
  readonly key: string; // context的key由api构造
  readonly method: HttpInstructMethod[];
  readonly proto: Record<string, unknown> | null;
  readonly reqHeaders: Record<string, unknown>;
  resHeaders: Record<string, unknown>;
  query: T['query'];
  params: T['params'];
  return?: {
    data: T['res']; // 返回对象
  };
}

export type HttpInstructMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE';

type Path = `/${string}`;
export type HttpInstruct = (path?: Path) => HttpInstructReturn;
export type HttpInstructReturn = {
  method: HttpInstructMethod;
  path?: Path;
};

export type HttpApiStatusResponse<D = any> = {
  statusCode?: number;
  statusMessage?: string;
  data?: UnPromisify<D>;
};

export type HttpApiHandler<C extends ContextData> = (ctx: HttpContext<C>) => Promise<C['res'] | CustomHandlerReturn<C['res']>>;

export type CustomHandlerReturn<D = any> = () => HttpApiStatusResponse & {
  headers?: Record<string, string>;
};

export type HttpApiInstructType = 'mandatory' | 'file-system'; // 指示器类型
export type HttpApiInstructReturn = Map<Path | undefined, { methods: Set<HttpInstructMethod>; type: HttpApiInstructType }>;
export type HttpApiReturn<C extends ContextData> = {
  instruct: HttpApiInstructReturn;
  // handler可以返回一个正确的res对象, 也可以返回一个集成api响应类型
  handler: HttpApiHandler<C>;
};

export type RouterHandlerOptions = {
  unicloud?: {
    urlized?: boolean;
  };
};

export type Plugin = {
  name: string;
  // 提供几个钩子用来定义函数，作为框架runtime的shim
  server?: {
    start: (...args: any[]) => Promise<void> | void;
  };
  log?: LogType;
  context?: (context: HttpContext) => HttpContext;
  // pipeline
  // preApi
  preApi?: PipelineNode<T> | PipelineNode<T>[];
  // postApi
  postApi?: PipelineNode<T> | PipelineNode<T>[];
};

// 仅仅注册一次的插件root类型定义
export type RegisterOneceRoot = (keyof Pick<Plugin, 'server' | 'log' | 'context'>)[];
