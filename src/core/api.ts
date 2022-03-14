import { useQuery, useBody, sendError } from 'h3';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getApiMap } from './map';
import log from '../log';
import { validateMethod, validateProto, getNeedValidateProto } from './validate';
import error from './error';
import type { App } from 'h3';
import type { HttpContext } from '@sword-code-practice/types/sword-backend-framework';

// 具体的proto schema引用
let protoSchema: Record<string, Record<string, unknown>> | null = null;

export const implementApi = async (app: App, dirName: string) => {
  // 获取apimap以及proto map
  const { apiMap } = await getApiMap(dirName);
  // 获取proto schema
  getProtoSchema();
  for (const key in apiMap) {
    // key: api value: path
    app?.use(key, async (req, res) => {
      // 打印json日志
      log.info(`[请求URL]: ${key}`);
      // url query参数
      const query = await useQuery(req);
      const params = await useBody(req);
      log.info(`[请求参数-query]: ${JSON.stringify(query)}`);
      log.info(`[请求参数-params]:  ${JSON.stringify(params)}`);
      // 构造context
      const context = createContext({
        key,
        query,
        params,
        method: apiMap[key].method
      });
      const _res = apiMap[key];
      // 检查method
      if (!validateMethod(req, context.method)) {
        // 如果校验method错误，就返回错误信息
        const errMsg = `Allowed request methods are: ${context.method.join(',')}, but got: ${req.method}`;
        log.err(`[请求方法错误]: ${errMsg}`);
        return sendError(res, error('VALIDATE_METHOD', errMsg));
      }
      // 获取符合要求的proto
      const { ReqParams: reqParamsProto, ReqQuery: reqQueryProto, Res: resProto } = getNeedValidateProto(context.proto);
      // 检查请求params的proto
      const requestParamsProtoResult = validateProto(reqParamsProto, params);
      // 检查请求query的proto
      const requestQueryProtoResult = validateProto(reqQueryProto, query);
      // 查看请求的参数校验结果，是否有错误
      const errorResult = [requestParamsProtoResult, requestQueryProtoResult].find((v: null | { isSucc: boolean }) => {
        return v && !v.isSucc;
      }) as undefined | { errMsg: string };
      // 如果找到了检测错误
      if (errorResult) {
        log.err(`[请求类型校验错误]:${JSON.stringify(errorResult.errMsg)}`);
        return sendError(res, error('VALIDATE_REQUEST', errorResult.errMsg));
      } else {
        // 执行handler
        const _handlerRes = await _res.handler(context);
        log.info(`[返回结果]: ${typeof _handlerRes === 'undefined' ? {} : JSON.stringify(_handlerRes)}`);
        // 校验返回结果是否符合预期
        const resProtoResult = validateProto(resProto, _handlerRes || {});
        if (!resProtoResult.isSucc) {
          // 如果返回结果不符合预期，就抛出错误
          log.err(`[返回类型校验错误]:${JSON.stringify(resProtoResult.errMsg)}`);
          return sendError(res, error('VALIDATE_RESPONSE', resProtoResult.errMsg));
        }
        return _handlerRes;
      }
    });
  }
};

// 创建context对象
const createContext = (context: Partial<HttpContext>): HttpContext => {
  // 查询key对应的proto
  let proto: Record<string, unknown> = {};
  if (protoSchema && protoSchema[context.key as string]) {
    proto = protoSchema[context.key as string];
  }
  return {
    key: context.key as string,
    proto,
    query: context.query,
    params: context.params,
    method: context.method as any
  };
};

// 加载根目录下的protoschema（由cli生成）
const getProtoSchema = async () => {
  const schema = readFileSync(resolve(process.cwd(), './src/proto.json')).toString();
  if (schema) {
    protoSchema = JSON.parse(schema) as any;
  }
};
