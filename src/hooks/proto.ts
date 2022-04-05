import type { Use } from '../../typings/index';
import { TSBufferValidator } from 'tsbuffer-validator';

// 检查proto
export const useValidateProto: Use['ValidateProto'] = (
  key,
  data,
  schema
):
  | {
      isSucc: true;
      errMsg?: undefined;
    }
  | {
      isSucc: false;
      errMsg: string;
    } => {
  const validator = new TSBufferValidator({ [key]: schema } as any);
  return validator.validate(data, key);
};
