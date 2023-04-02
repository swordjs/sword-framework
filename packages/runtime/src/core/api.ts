import { validateMethod, validateProto, getNeedValidateProto } from './validate';
import { exec } from './pipeline';
import error from './error';
import { isJSON } from '~util/data';
import { parseCommandArgs, commandArgs as _commandArgs } from '~util/config';
import { useQuery } from '~util/route';
import { getLogger } from './log';
import { aggregatePlugin } from './plugin';
import { platformHook } from './platform';
import {
  adaptEvent as adaptServerEvent,
  implementApi as implementServerApi,
  apiError as apiServerError,
  apiResponseHeaders as apiServerResponseHeaders
} from './platform/server/api';
import { adaptUnicloudEvent } from './platform/unicloud/api';
import type * as H3 from '@swordjs/h3';
import type { HttpContext, HttpInstructMethod, UnPromisify, Event, CustomHandlerReturn, HttpApiStatusResponse, RouterHandlerOptions } from '~types/index';
import type { ValidateProto } from './validate';
import type { InterruptPipelineResult } from './pipeline';
import type { Map } from './map';

let commandArgs = _commandArgs;

const log = getLogger();

// 支持的methods数组
export const methods: HttpInstructMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];

/**
 *
 * event需要在不同平台之间进行适配
 * @param {Event} event
 * @return {*}  {AdaptEventReturn}
 */
type AdaptEventReturn = Promise<{ key: string; req: any; res: any; method: HttpInstructMethod; params: any; query: any }>;
export const adaptEvent = async (event: Event): AdaptEventReturn => {
  // 兼容vitest测试环境, 我们需要重新获取正确的command args
  // 在这里需要重新获取的原因是, 我们的adaptEvent测试用例, 显式地传递了command args, 但是在我们开发/生产环境中, commandArgs是一个全局变量, 它只运行一次, 但是测试环境需要获取多次, 所以我们需要重新获取
  // 参考测试用例, test/core/platform.test.ts
  if (process.env.VITEST) {
    commandArgs = parseCommandArgs();
  }
  type Return = Record<Exclude<keyof UnPromisify<AdaptEventReturn>, 'query'>, any>;
  const result: Return = (await platformHook<Return>(
    {
      server: async () => await adaptServerEvent(event),
      unicloud: async () => await adaptUnicloudEvent(event)
    },
    commandArgs.platform
  )) as any;
  return {
    ...result,
    key: result['key'].split('?')[0],
    // 将key上的query参数和query对象进行合并
    query: {
      ...isJSON(await useQuery(result['key'])),
      ...((event as any).query ?? {})
    }
  };
};

/**
 *
 * 处理多个平台的错误返回
 * @param {Event} event
 * @param {(H3.H3Error | HttpApiStatusResponse<any>)} errorReturn
 * @return {*}  {(Promise<HttpApiStatusResponse | void>)}
 */
export const handleError = async (event: Event, errorReturn: H3.H3Error | HttpApiStatusResponse<any>): Promise<HttpApiStatusResponse | void> => {
  return await platformHook<HttpApiStatusResponse | void>({
    server: async () => await apiServerError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error),
    unicloud: () => errorReturn
  });
};

/**
 *
 * 处理exec pipeline 错误 (middleware pipeline)
 * @param {Event} event
 * @param {UnPromisify<ReturnType<typeof exec>>} execResult
 * @return {*}
 */
const handleExecPipelineError = async (event: Event, execResult: UnPromisify<ReturnType<typeof exec>>, options?: RouterHandlerOptions) => {
  // 判断execresult的类型
  if (execResult instanceof Error) {
    const errorReturn = await error('PIPELINE_ERROR', execResult.message, null, options);
    return await handleError(event as Event, errorReturn);
  }
  return true;
};

/**
 *
 * 处理错误的返回
 * @param {Event} event
 * @param {ReturnType<typeof validateProto>} validateResult
 * @return {*}
 */
const handleErrorResponse = async (event: Event, validateResult: ReturnType<typeof validateProto>, options?: RouterHandlerOptions) => {
  const errorReturn = await error('VALIDATE_RESPONSE', validateResult.errMsg as string, null, options);
  log.RESPONSE_TYPE_ERROR(JSON.stringify(validateResult.errMsg));
  return await handleError(event as Event, errorReturn);
};

/**
 *
 * 处理检查method
 * @param {Event} event
 * @param {HttpContext} context
 * @param {*} req
 * @return {*}
 */
const handleValidateMethod = async (event: Event, context: HttpContext, req: any, options?: RouterHandlerOptions) => {
  if (!(await validateMethod(req, context.method))) {
    // 如果校验method错误，就返回错误信息
    const errMsg = `Allowed request methods are: ${context.method.join(',')}, but got: ${req.method}`;
    log.REQUEST_METHOD_ERROR(errMsg);
    const errorReturn = await error('VALIDATE_METHOD', errMsg, null, options);
    return await handleError(event as Event, errorReturn);
  }
  return true;
};

/**
 *
 * 处理返回请求头
 * @param {Event} event
 * @param {HttpContext['resHeaders']} headers
 * @return {*}
 */
const handleResHeaders = (event: Event, headers: HttpContext['resHeaders']) => {
  if (headers) {
    return platformHook({
      server: async () => await apiServerResponseHeaders(event as H3.CompatibilityEvent, headers)
    });
  }
};

type ProtoData = { proto: ValidateProto; data: any };

/**
 *
 * 处理检查request proto
 * @param {Event} event
 * @param {HttpContext} context
 * @param {ProtoData} params
 * @param {ProtoData} query
 * @return {*}
 */
const handleValidateRequestProto = async (event: Event, context: HttpContext, params: ProtoData, query: ProtoData, options?: RouterHandlerOptions) => {
  // 检查请求params的proto
  const requestParamsProtoResult = validateProto(params.proto, params.data);
  // 检查请求query的proto
  const requestQueryProtoResult = validateProto(query.proto, query.data);
  // 查看请求的参数校验结果，是否有错误
  const errorResult = [requestParamsProtoResult, requestQueryProtoResult].find((v: null | { isSucc: boolean }) => {
    return v && !v.isSucc;
  }) as undefined | { errMsg: string };
  if (errorResult) {
    log.REQUEST_TYPE_ERROR(JSON.stringify(errorResult.errMsg));
    handleResHeaders(event, context.resHeaders);
    const errorReturn = await error('VALIDATE_REQUEST', errorResult.errMsg, null, options);
    return await handleError(event as Event, errorReturn);
  }
  return true;
};

/**
 *
 * 封装pipeline result不同类型的处理
 * @param {(HttpContext | InterruptPipelineResult)} pipelineResult
 * @param {(HttpContext | InterruptPipelineResult)} context
 * @param {{
 *     return: (context: InterruptPipelineResult['current'], returnData: InterruptPipelineResult['current']['return']) => any;
 *     stop: (context: InterruptPipelineResult['last']) => any;
 *     cb: (context: HttpContext) => any;
 *   }} map
 * @return {*}
 */
const pipelineResultTypeMap = (
  pipelineResult: HttpContext | InterruptPipelineResult,
  context: HttpContext | InterruptPipelineResult,
  map: {
    return: (context: InterruptPipelineResult['current'], returnData: InterruptPipelineResult['current']['return']) => any;
    stop: (context: InterruptPipelineResult['last']) => any;
    cb: (context: HttpContext) => any;
  }
) => {
  if ((pipelineResult as InterruptPipelineResult).type === 'return') {
    return map.return((pipelineResult as InterruptPipelineResult).current || context, (pipelineResult as InterruptPipelineResult).current.return);
  } else if ((pipelineResult as InterruptPipelineResult).type === 'stop') {
    return map.stop((pipelineResult as InterruptPipelineResult).last || context);
  } else {
    return map.cb((pipelineResult as HttpContext) || context);
  }
};

/**
 *
 * 处理preApiCall pipeline
 * @param {(HttpContext | InterruptPipelineResult)} preApiCallExecResult
 * @param {Event} event
 * @param {(HttpContext | InterruptPipelineResult)} context
 * @return {*}  {({ context: HttpContext; returnData: null | unknown })}
 */
const handlePreApiCall = (
  preApiCallExecResult: HttpContext | InterruptPipelineResult,
  event: Event,
  context: HttpContext | InterruptPipelineResult
): { context: HttpContext; returnData: null | unknown } => {
  return pipelineResultTypeMap(preApiCallExecResult, context, {
    return: (context, returnData) => {
      handleResHeaders(event, context.resHeaders);
      log.RESPONSE_RESULT(JSON.stringify(returnData?.data), '-preApiCall');
      // 直接返回result
      return { context, returnData };
    },
    stop: (context) => {
      handleResHeaders(event, context.resHeaders);
      return { context };
    },
    cb: (context) => {
      return { context };
    }
  });
};

/**
 *
 * 处理postapiCall pipeline
 * @param {(HttpContext | InterruptPipelineResult)} postApiCallExecResult
 * @param {Event} event
 * @param {(HttpContext | InterruptPipelineResult)} context
 * @return {*}
 */
const handlePostApiCall = (postApiCallExecResult: HttpContext | InterruptPipelineResult, event: Event, context: HttpContext | InterruptPipelineResult) => {
  return pipelineResultTypeMap(postApiCallExecResult, context, {
    return: (context, returnData) => {
      handleResHeaders(event, context.resHeaders);
      // 直接返回result
      log.RESPONSE_RESULT(JSON.stringify(returnData?.data), '-postApiCall');
      return { context, returnData };
    },
    stop: (context) => {
      handleResHeaders(event, context.resHeaders);
      return { context };
    },
    cb: (context) => {
      handleResHeaders(event, context.resHeaders);
      return { context };
    }
  });
};

/**
 *
 * 实现API的装载
 * @param {App} app
 */
export const implementApi = async (app: H3.App | null) => {
  await platformHook({
    server: async () => await implementServerApi(app)
  });
};

/**
 *
 * 创建context对象
 * @param {Partial<HttpContext>} context
 * @return {*}  {HttpContext}
 */
const createContext = (context: Partial<HttpContext>): HttpContext => {
  let result = {
    key: context.key as string,
    // proto可能为null, 因为api.json中提取的proto是根据api的url提取的
    // 在异常情况下, api匹配不成功, 则proto为null
    proto: context.proto as Record<string, unknown> | null,
    reqHeaders: context.reqHeaders as Record<string, unknown>,
    resHeaders: context.resHeaders as Record<string, unknown>,
    query: context.query,
    params: context.params,
    method: context.method as any
  };
  // 注入plugin中的context, 如果plugin中有context，则会覆盖掉上面的context
  if (aggregatePlugin?.context) {
    result = aggregatePlugin?.context.plugin(result);
  }
  return result;
};

/**
 *
 * 处理api的集成返回结果
 * @param {Event} event
 * @param {ReturnType<CustomHandlerReturn<any>>} handlerRes
 * @return {*}  {Promise<ReturnType<CustomHandlerReturn<any>>>}
 */
const handleCustomApiReturn = async (event: Event, handlerRes: ReturnType<CustomHandlerReturn<any>>): Promise<ReturnType<CustomHandlerReturn<any>>> => {
  // 从集成响应中提取参数
  const headers = handlerRes.headers ?? {};
  const statusCode = handlerRes.statusCode ?? 200;
  const statusMessage = handlerRes.statusMessage ?? '';
  const data = handlerRes.data ?? {};
  // 处理集成响应的headers
  handleResHeaders(event, headers);
  return { headers, statusCode, statusMessage, data };
};

/**
 * 通用路由处理函数
 * @param {string} key
 * @param {Event} event
 * @param {Record<string, Map>} apiMap
 * @param {{
 *     unicloud?: {
 *       originContext?: UnicloudOriginContext;
 *     };
 *   }} options
 * @return {*}
 */
export const routerHandler = async (key: string, event: Event, apiMap: Record<string, Map>, options?: RouterHandlerOptions) => {
  // eslint-disable-next-line prefer-const
  let { key: _key, req, params, query } = await adaptEvent(event);
  // 将重新处理的key替换
  key = _key;
  // 日志-请求url
  log.REQUEST_URL(key);
  params = isJSON(params);
  // 构造context
  let context = createContext({
    key,
    query,
    params,
    reqHeaders: req.headers ?? {},
    resHeaders: {}, // 返回请求头默认为空
    method: apiMap[key].method,
    proto: apiMap[key].proto as any
  });
  const _res = apiMap[key];
  // 校验method
  const validateMethodResult = await handleValidateMethod(event, context, req, options);
  if (validateMethodResult !== true) return validateMethodResult;
  // 获取符合要求的proto
  const { ReqParams: reqParamsProto, ReqQuery: reqQueryProto, Res: resProto } = getNeedValidateProto(context.proto);
  // 校验请求proto
  const validateRequestProtoResult = await handleValidateRequestProto(
    event,
    context,
    { proto: reqParamsProto, data: params },
    { proto: reqQueryProto, data: query },
    options
  );
  if (validateRequestProtoResult !== true) return validateRequestProtoResult;
  // 执行pipeline
  const preApiCallExecResult = await exec('preApiCall', context);
  if (await handleExecPipelineError(event, preApiCallExecResult, options)) {
    // 如果为true说明pipeline执行没有出错，所以这里判断正确执行的情况
    if (!(preApiCallExecResult instanceof Error)) {
      // 处理PreApiCall Pipline
      const { context: preApiCallContext, returnData: preApiCallReturnData } = handlePreApiCall(preApiCallExecResult, event, context);
      // 判断returndata是否存在, 如果存在，则直接返回
      if (preApiCallReturnData) return preApiCallReturnData;
      // 经过pipeline后的context需要重新赋值
      context = preApiCallContext;
      log.REQUEST_QUERY(JSON.stringify(context.query));
      log.REQUEST_PARAMS(JSON.stringify(context.params));
      // 执行handler
      let _handlerRes;
      // 集成handler返回值
      let _customHandlerRes;
      try {
        // handler的返回有可能是一个函数, 如果是函数则就代表了它是一个集成响应, 我们需要对集成响应作出额外处理
        _handlerRes = await _res.handler(context);
        if (typeof _handlerRes === 'function') {
          _customHandlerRes = await handleCustomApiReturn(event, (_handlerRes as CustomHandlerReturn<any>)());
          // 将data赋值给_handlerRes, 因为之后的逻辑要校验data
          _handlerRes = _customHandlerRes.data;
        }
      } catch (e) {
        log.EXECUTE_ERROR(JSON.stringify(e));
        // 如果handler出错，则直接返回错误
        return await error('EXECUTE_HANDLER_ERROR', 'handler error', null, options);
      }
      // 执行pipeline
      const postApiCallExecResult = await exec('postApiCall', context);
      if (await handleExecPipelineError(event, postApiCallExecResult, options)) {
        if (!(postApiCallExecResult instanceof Error)) {
          const { returnData: postApiCallReturnData } = handlePostApiCall(postApiCallExecResult, event, context);
          if (postApiCallReturnData) return postApiCallReturnData;
          // 校验返回结果是否符合预期
          const resProtoResult = validateProto(resProto, (_handlerRes as any) || {});
          if (!resProtoResult.isSucc) {
            // 如果返回结果不符合预期，就抛出错误
            return await handleErrorResponse(event, resProtoResult, options);
          }
        }
      }
      log.RESPONSE_RESULT(typeof _handlerRes === 'undefined' ? '{}' : JSON.stringify(_handlerRes));
      // 如果所有的流程都执行成功，则返回结果, 它是一个数组, 数组的第一个值是返回的结果, 第二个值是聚合的源结果 (如果返回的是集成对象的话)
      return [_handlerRes, _customHandlerRes];
    }
  }
};
