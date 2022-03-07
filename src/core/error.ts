import { createError } from 'h3';

// 校验参数错误
export const validateProtoError = (message: string) => {
  return createError({
    statusCode: 400,
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
