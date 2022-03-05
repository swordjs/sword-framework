import type { HttpApi, HttpInstructMethod, Use } from '@sword-code-practice/types/sword-backend-framework';
import { createServer } from 'http';
import { createApp } from 'h3';
import { TSBufferValidator } from 'tsbuffer-validator';
import log from '../log';

// 创建API
export const useApi: HttpApi = (instruct, handler) => {
  // 对指示器做一下输出处理，避免编译器做过多逻辑
  let path;
  let method: HttpInstructMethod[] = [];
  // 如果传递了多个指示器
  if (Array.isArray(instruct)) {
    // 对instruct进行过滤，将非法的错误进行排除
    instruct = instruct.filter((i) => i.path && i.path.trim() !== '');
    if (instruct.length === 0) {
      // 如果传入了一个空数组，就默认给一个method
      method.push('GET');
    } else {
      // 取出method，并且进行去重复
      method = [...new Set(instruct.map((i) => i.method))];
      path = instruct[0].path;
    }
  } else {
    // 如果仅仅传入了一个指示器，那么直接对method和path做处理
    method.push(instruct.method);
    if (instruct.path && instruct.path.trim() !== '') path = instruct.path;
  }
  return {
    instruct: {
      method,
      path
    },
    validateProto: useValidateProto,
    handler
  };
};

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

// 创建sword app
export const useApp = () => {
  const app = createApp();
  return createServer(app);
};

export * from './instruct';
