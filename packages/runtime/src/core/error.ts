import { getAsyncDependency } from '../core/schedule';
import { platformHook } from './platform';
import type * as H3 from '@swordjs/h3';
import type { HttpApiStatusResponse } from '../../../../typings/index';

// 定义不同错误类型以及它们所代表的状态码
// 定义错误类型
enum ErrorType {
  // 未找到
  NOT_FOUND = 404,
  // 请求
  VALIDATE_REQUEST = 400,
  // 返回
  VALIDATE_RESPONSE = 500,
  // 请求方法
  VALIDATE_METHOD = 405,
  // 中间件错误
  PIPELINE_ERROR = 500,
  // 执行handler错误
  EXECUTE_HANDLER_ERROR = 500
}

export default async (type: keyof typeof ErrorType | number, message: string, data?: unknown): Promise<H3.H3Error | HttpApiStatusResponse> => {
  const res: H3.H3Error | HttpApiStatusResponse = {
    // 如果type是number类型, 那么就认为是状态码, 反之则认为是错误类型
    statusCode: typeof type === 'number' ? type : ErrorType[type],
    statusMessage: message,
    data
  };
  return (await platformHook<H3.H3Error | HttpApiStatusResponse>({
    server: () => getAsyncDependency('@swordjs/h3').createError(res),
    unicloud: () => res
  })) as any;
};
