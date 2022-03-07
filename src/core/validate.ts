import { isMethod } from 'h3';
import type { HttpInstructMethod, HttpApiReturn, HttpContext, Use } from '@sword-code-practice/types/sword-backend-framework';

/**
 *
 * 校验method是否合法
 * @param {*} req
 * @param {(HttpInstructMethod | HttpInstructMethod[])} expected
 * @return {*}  {boolean}
 */
export const validateMethod = (req: any, expected: HttpInstructMethod | HttpInstructMethod[]): boolean => {
  return isMethod(req, expected);
};

/**
 *
 * 校验请求中的params以及query
 * @param {HttpContext<any>} context
 * @param {Record<string, string>} query
 * @param {Record<string, unknown>} params
 * @param {Use['ValidateProto']} validateProto
 * @return {*}
 */
export const validateRequestProto = (
  context: HttpContext<any>,
  query: Record<string, string>,
  params: Record<string, unknown>,
  validateProto: Use['ValidateProto']
) => {
  // 判断query/params 是否有传入空对象，如果是空对象我们就把query/params移除检查，所以我们需要动态的构造 validateResultMap
  // 动态根据参数构造验证结果集
  const validateResultMap: Record<string, any> = {
    ReqQuery: JSON.stringify(query) === '{}' ? undefined : null,
    ReqParams: JSON.stringify(params) === '{}' ? undefined : null
  };

  // 验证
  const validate = (key: string, data: any, schema: any) => {
    return validateProto(key, data, schema);
  };

  // 返回结果集数组
  const validateResultMapReturn = () => {
    return [validateResultMap['ReqParams'] || null, validateResultMap['ReqQuery'] || null];
  };

  for (const key in context.proto) {
    // 如果当前结果集已经没有null了（程序需要的指定proto已经全部检测了）就返回结果集
    if (Object.values(validateResultMap).filter((v) => v === null).length === 0) {
      // 如果检查完了就返回
      return validateResultMapReturn();
    }
    // 循环结果集
    let v: keyof typeof validateResultMap;
    for (v in validateResultMap) {
      // 查看key是否存在name字符串的末尾
      const _ = key.split(v);
      if (_.length > 1 && _[_.length - 1] === '') {
        // 如果该type/interface正确的在root中，就说明是一个合法的proto类型声明，开始校验
        // 如果校验完成，就开始循环下一个proto
        const result = validate(key, v === 'ReqParams' ? params : query, context.proto[key]);
        validateResultMap[v] = result as any;
        break;
      }
    }
  }
  return validateResultMapReturn();
};
