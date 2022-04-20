import { isMethod } from '@sword-code-practice/h3';
import { useValidateProto } from '../hooks/proto';
import type { HttpInstructMethod, HttpContext } from '../../typings/index';

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

// 需要校验的proto节点
export type ValidateProto = { key: string; data: Record<string, unknown> } | null;

// 获取需要校验的proto
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getNeedValidateProto = (proto: HttpContext<any>['proto']) => {
  const validateProtoKeys: Record<'ReqQuery' | 'ReqParams' | 'Res', ValidateProto> = {
    ReqQuery: null,
    ReqParams: null,
    Res: null
  };
  for (const key in proto) {
    let v: keyof typeof validateProtoKeys;
    for (v in validateProtoKeys) {
      const _ = key.split(v as string);
      if (_.length > 1 && _[_.length - 1] === '') {
        // 如果该type/interface正确的在root中，就说明是一个合法的proto类型声明，允许校验
        validateProtoKeys[v] = {
          key,
          data: proto[key] as any
        };
      }
    }
  }
  return validateProtoKeys;
};

/**
 *
 * 校验proto
 * @param {unknown} proto
 * @param {Record<string, unknown>} data
 * @return {*}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const validateProto = (
  proto: ValidateProto,
  data: Record<string, unknown>
):
  | {
      isSucc: true;
      errMsg?: undefined;
    }
  | {
      isSucc: false;
      errMsg: string;
    } => {
  if (proto?.key) {
    return useValidateProto(proto?.key, data, proto?.data);
  }
  // 如果key为空，说明需要校验的proto开发者没有填写，这里就默认校验成功
  return {
    isSucc: true
  };
};
