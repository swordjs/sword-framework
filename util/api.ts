// 判断状态码是否是2xx
export const httpStatusCorrect = (statusCode: number) => {
  return !(statusCode < 200 || statusCode >= 300);
};
