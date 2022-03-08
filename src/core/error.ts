import { createError } from 'h3';

// 校验参数错误
export const validateProtoError = (message: string) => {
  return createError({
    statusCode: 400,
    statusMessage: message
  });
};

// 校验返回参数错误（服务器内部）
export const validateResProtoError = (message: string) => {
  return createError({
    statusCode: 500,
    statusMessage: message
  });
};

// 校验methods错误
export const validateMethodError = (message: string) => {
  return createError({
    statusCode: 405,
    statusMessage: message
  });
};
