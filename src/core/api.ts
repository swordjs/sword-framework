import { createRouter, useQuery, useBody, sendError } from 'h3';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getApiMap } from './map';
import { validateMethod, validateProto, getNeedValidateProto } from './validate';
import { exec } from './pipeline';
import error from './error';
import { isJSON } from '../util/data';
import { log } from './log';
import type { App } from 'h3';
import type { HttpContext } from '@sword-code-practice/types/sword-backend-framework';
import type { UnPromisify } from '../../typings/index';
import type { ValidateProto } from './validate';

// 具体的proto schema引用
let protoSchema: Record<string, Record<string, unknown>> | null = null;

// 定义log集合
const logMap = {
  REQUEST_URL: (key: string) => log.info(`[请求URL]: ${key}`),
  REQUEST_METHOD_ERROR: (msg: string) => log.err(`[请求方法错误]: ${msg}`),
  REQUEST_TYPE_ERROR: (msg: string) => log.err(`[请求类型校验错误]:${msg}`),
  REQUEST_QUERY: (query: string) => log.info(`[请求参数-query]: ${query}`),
  REQUEST_PARAMS: (query: string) => log.info(`[请求参数-params]: ${query}`),
  RESPONSE_RESULT: (msg: string, suffix = '') => log.info(`[返回结果${suffix}]: ${msg}`),
  RESPONSE_TYPE_ERROR: (msg: string) => log.err(`[返回类型校验错误]:${msg}`)
};

/**
 *
 * 处理exec (middleware pipeline)
 * @param {UnPromisify<ReturnType<typeof exec>>} execResult
 * @param {ServerResponse} res
 * @return {*}
 */
const handleExecError = (execResult: UnPromisify<ReturnType<typeof exec>>, res: any) => {
  // 判断execresult的类型
  if (execResult instanceof Error) {
    return sendError(res, error('PIPELINE_ERROR', execResult.message));
  }
  return true;
};

/**
 *
 * 处理检查method
 * @param {HttpContext} context
 * @param {any} req
 * @param {any} res
 * @return {*}
 */
const handleValidateMethod = (context: HttpContext, req: any, res: any) => {
  if (!validateMethod(req, context.method)) {
    // 如果校验method错误，就返回错误信息
    const errMsg = `Allowed request methods are: ${context.method.join(',')}, but got: ${req.method}`;
    logMap.REQUEST_METHOD_ERROR(errMsg);
    return sendError(res, error('VALIDATE_METHOD', errMsg));
  }
  return true;
};

type ProtoData = { proto: ValidateProto; data: any };

/**
 *
 * 处理检查request proto
 * @param {ProtoData} params
 * @param {ProtoData} query
 * @param {any} res
 * @param {() => void} cb
 * @return {*}
 */
const handleValidateRequestProto = (params: ProtoData, query: ProtoData, res: any, cb: () => void) => {
  // 检查请求params的proto
  const requestParamsProtoResult = validateProto(params.proto, params.data);
  // 检查请求query的proto
  const requestQueryProtoResult = validateProto(query.proto, query.data);
  // 查看请求的参数校验结果，是否有错误
  const errorResult = [requestParamsProtoResult, requestQueryProtoResult].find((v: null | { isSucc: boolean }) => {
    return v && !v.isSucc;
  }) as undefined | { errMsg: string };
  if (errorResult) {
    logMap.REQUEST_TYPE_ERROR(JSON.stringify(errorResult.errMsg));
    return sendError(res, error('VALIDATE_REQUEST', errorResult.errMsg));
  } else {
    // proto检测成功的回调
    return cb();
  }
};

// 在核心程序中，读取usebody的时候，需要进行判断，只有在几个method的请求上才可以对body进行解析
const readBodyPayloadMethods = ['PATCH', 'POST', 'PUT', 'DELETE'];

/**
 *
 * 实现API的装载
 * @param {App} app
 * @param {string} dirName
 */
export const implementApi = async (app: App) => {
  // 获取apimap以及proto map
  const { apiMap } = await getApiMap();
  const router = createRouter();
  // 获取proto schema
  getProtoSchema();
  for (const key in apiMap) {
    // key: api value: path
    router.add(key, async (req: any, res: any) => {
      logMap.REQUEST_URL(key);
      // url query参数
      const query = isJSON(await useQuery(req));
      const params = isJSON(readBodyPayloadMethods.includes(req.method as string) ? await useBody(req) : {});
      // 构造context
      let context = createContext({
        key,
        query,
        params,
        method: apiMap[key].method
      });
      const _res = apiMap[key];
      // 校验method
      const validateMethodResult = handleValidateMethod(context, req, res);
      if (!validateMethodResult) return validateMethodResult;
      // 获取符合要求的proto
      const { ReqParams: reqParamsProto, ReqQuery: reqQueryProto, Res: resProto } = getNeedValidateProto(context.proto);
      // 校验请求proto，如果成功则会执行回调
      return handleValidateRequestProto({ proto: reqParamsProto, data: params }, { proto: reqQueryProto, data: query }, res, async () => {
        // 执行pipeline
        const preApiCallExecResult = await exec('preApiCall', context);
        if (handleExecError(preApiCallExecResult, res)) {
          // 如果为true说明pipeline执行没有出错，所以这里判断正确执行的情况
          if (!(preApiCallExecResult instanceof Error)) {
            if (Array.isArray(preApiCallExecResult)) {
              // 如果pipeline返回了null或者undefined，我们就把context替换为上一个pipeline的返回结果
              context = preApiCallExecResult[preApiCallExecResult.length - 1] as HttpContext;
            } else if (preApiCallExecResult.return) {
              // 判断是否有return，就不用执行handler，直接返回data
              // 直接返回的data不会校验返回类型
              const res = preApiCallExecResult.return.data;
              logMap.RESPONSE_RESULT(JSON.stringify(res), '-preApiCall');
              return res;
            } else {
              // 如果所有的情况都避过了，即非error，非边界条件（return null | undefined）,非中途直接返回
              // 就只剩正常的pipeline返回情况了，即替换context进行请求
              context = preApiCallExecResult as HttpContext;
            }
            logMap.REQUEST_QUERY(JSON.stringify(context.query));
            logMap.REQUEST_PARAMS(JSON.stringify(context.params));
            // 执行handler
            const _handlerRes = await _res.handler(context);
            // 执行pipeline
            const postApiCallExecResult = await exec('postApiCall', context);
            if (handleExecError(postApiCallExecResult, res)) {
              if (!(postApiCallExecResult instanceof Error)) {
                if (!Array.isArray(postApiCallExecResult) && postApiCallExecResult.return) {
                  // 直接返回return的内容，不经过类型校验
                  const data = postApiCallExecResult.return.data;
                  logMap.RESPONSE_RESULT(JSON.stringify(data), '-postApiCall');
                  return data as any;
                } else {
                  // 校验返回结果是否符合预期
                  const resProtoResult = validateProto(resProto, (_handlerRes as any) || {});
                  if (!resProtoResult.isSucc) {
                    // 如果返回结果不符合预期，就抛出错误
                    logMap.RESPONSE_TYPE_ERROR(JSON.stringify(resProtoResult.errMsg));
                    return sendError(res, error('VALIDATE_RESPONSE', resProtoResult.errMsg));
                  }
                }
              }
            }
            logMap.RESPONSE_RESULT(typeof _handlerRes === 'undefined' ? '{}' : JSON.stringify(_handlerRes));
            return _handlerRes;
          }
        }
      });
    });
  }
  app.use(router);
};

/**
 *
 * 创建context对象
 * @param {Partial<HttpContext>} context
 * @return {*}  {HttpContext}
 */
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

/**
 * 加载根目录下的protoschema（由cli生成）
 */
const getProtoSchema = async () => {
  const schema = readFileSync(resolve(process.cwd(), './src/proto.json')).toString();
  if (schema) {
    protoSchema = JSON.parse(schema) as any;
  }
};
