import { parseCommandArgs, commandArgs } from '../util/config';
import { getAsyncDependency } from '../core/schedule';
import type H3 from '@sword-code-practice/h3';

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
  PIPELINE_ERROR = 500
}

export type ErrorResponse = {
  statusCode: number;
  statusMessage: string;
};
export type ErrorReturn = H3.H3Error | ErrorResponse;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (type: keyof typeof ErrorType, message: string): H3.H3Error | ErrorResponse => {
  const platform = commandArgs.platform;
  const data = {
    statusCode: ErrorType[type],
    statusMessage: message
  };
  if (platform === 'server') {
    return getAsyncDependency('@sword-code-practice/h3').createError(data);
  }
  return data;
};
