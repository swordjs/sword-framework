import { useQuery, useBody, sendError } from 'h3';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { getApiProtoMap } from './map';
import log from '../log';
import { validateMethod, validateRequestProto } from './validate';
import { validateProtoError, validateMethodError } from './error';
import type { App } from 'h3';
import type { HttpContext } from '@sword-code-practice/types/sword-backend-framework';

// 具体的proto schema引用
const protoSchema: Record<string, Record<string, unknown>> | null = null;

export const implementApi = async (app: App, dirName: string) => {
  // 获取apimap以及proto map
  const { apiMap, protoMap } = await getApiProtoMap(dirName);
  // 将api都放入h3的app中
  // 循环apimap
  for (const key in apiMap) {
    // key: api value: path
    // 清除缓存，让旧模块无效，无需重启服务器，在开发阶段享受HMR
    delete require.cache[apiMap[key].sourcePath];
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
        return sendError(res, validateMethodError(errMsg));
      }
      // 检查proto
      const validateProtoResult = validateRequestProto(context, query, params, apiMap[key].validateProto);
      // 查看是否有错误的结果
      const errorResult = validateProtoResult.find((v: null | { isSucc: boolean }) => {
        return v && !v.isSucc;
      }) as undefined | { errMsg: string };
      // 如果找到了检测错误
      if (errorResult) {
        log.err(`[请求类型校验错误]:${errorResult}`);
        return sendError(res, validateProtoError(errorResult.errMsg));
      } else {
        // 执行handler
        const _handlerRes = await _res.handler(context);
        log.info(`[返回结果]: ${typeof _handlerRes === 'undefined' ? null : JSON.stringify(_handlerRes)}`);
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
