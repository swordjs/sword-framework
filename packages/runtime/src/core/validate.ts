import { TSBufferValidator } from 'tsbuffer-validator';
import { platformHook } from './platform';
import { getAsyncDependency } from './schedule';
import type { HttpInstructMethod, HttpContext } from '../../../../typings/index';
import type * as H3 from '@sword-code-practice/h3';
import type { UnicloudEvent } from '../../../../typings/unicloud';

/**
 *
 * 校验method是否合法
 * @param {(H3.CompatibilityEvent | UnicloudEvent)} req
 * @param {(HttpInstructMethod | HttpInstructMethod[])} expected
 * @return {*}  {Promise<boolean>}
 */
export const validateMethod = async (req: H3.CompatibilityEvent | UnicloudEvent, expected: HttpInstructMethod | HttpInstructMethod[]): Promise<boolean> => {
  return (await platformHook<boolean>({
    server: async () => {
      return getAsyncDependency<typeof H3>('@sword-code-practice/h3').isMethod(req as H3.CompatibilityEvent, expected);
    },
    unicloud: () => {
      const _req = req as UnicloudEvent;
      // 在unicloud环境下, req即unicloud event
      return expected.includes(_req.method);
    }
  })) as boolean;
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
    const validator = new TSBufferValidator({ [proto?.key]: proto?.data } as any);
    return validator.validate(data, proto?.key);
  }
  // 如果key为空，说明需要校验的proto开发者没有填写，这里就默认校验成功
  return {
    isSucc: true
  };
};
