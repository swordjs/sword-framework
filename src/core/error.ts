import { createError } from 'h3';

// 定义不同错误类型以及它们所代表的状态码
// 定义错误类型
enum ErrorType {
  // 请求
  VALIDATE_REQUEST = 400,
  // 返回
  VALIDATE_RESPONSE = 500,
  // 请求方法
  VALIDATE_METHOD = 405,
  // 中间件错误
  PIPELINE_ERROR = 500
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (type: keyof typeof ErrorType, message: string) => {
  return createError({
    statusCode: ErrorType[type],
    statusMessage: message
  });
};
