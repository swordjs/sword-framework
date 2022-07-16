import { getAsyncDependency } from '../core/schedule';
import { unicloudResponse } from '../core/platform/unicloud/api';
import { platformHook } from './platform';
import type * as H3 from '@swordjs/h3';
import type { HttpApiStatusResponse, RouterHandlerOptions } from '#types/index';

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

export default async <Options = RouterHandlerOptions>(
  type: keyof typeof ErrorType | number,
  message: string,
  data?: unknown,
  options?: Options
): Promise<H3.H3Error | HttpApiStatusResponse> => {
  const res: H3.H3Error | HttpApiStatusResponse = {
    // 如果type是number类型, 那么就认为是状态码, 反之则认为是错误类型
    statusCode: typeof type === 'number' ? type : ErrorType[type],
    statusMessage: message,
    data
  };
  return (await platformHook<H3.H3Error | HttpApiStatusResponse>({
    // server环境创建错误对象
    server: () => getAsyncDependency<typeof H3>('@swordjs/h3').createError(res),
    // unicloud环境创建错误对象, 需要传递routeroption 中的 unicloud配置
    // 这样unicloud中封装的返回方法, 会自动判断unicloud的2种调用方式, 返回正确的对象
    unicloud: () => unicloudResponse(res, (options as RouterHandlerOptions).unicloud)
  })) as any;
};
