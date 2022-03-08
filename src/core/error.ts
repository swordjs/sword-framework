import { createError } from 'h3';

// 定义不同错误类型以及它们所代表的状态码
// 定义错误类型
enum ErrorType {
  VALIDATE_REQUEST = 400,
  VALIDATE_RESPONSE = 500,
  VALIDATE_METHOD = 405
}

export default (type: keyof typeof ErrorType, message: string) => {
  return createError({
    statusCode: ErrorType[type],
    statusMessage: message
  });
};
