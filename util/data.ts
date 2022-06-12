// 判断输入的值的类型，如果是json字符串就parse后返回，反之直接返回
export const isJSON = <T = string | Record<string, unknown>>(input: T): T => {
  if (typeof input === 'string') {
    try {
      const obj = JSON.parse(input);
      if (typeof obj == 'object' && obj) {
        return obj;
      }
    } catch (e) {
      // 抛出错误
      throw new Error(`${input} is not a valid json`);
    }
  }
  return input;
};
