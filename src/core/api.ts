import { h3 } from './index';
import { readFileSync } from 'fs';
import { getApiMap } from './map';
import { validateMethod, validateProto, getNeedValidateProto } from './validate';
import { getSourcePath } from '../util/path';
import { exec } from './pipeline';
import error from './error';
import { isJSON } from '../util/data';
import { getLogger } from './log';
import { aggregatePlugin } from './plugin';
import { parseCommandArgs, commandArgs as _commandArgs } from '../util/config';
import { useQuery } from '../util/route';
import { platformHook } from './platform';
import type H3 from '@sword-code-practice/h3';
import type { UnicloudEvent } from '../../typings/unicloud';
import type { HttpContext, HttpInstructMethod, UnPromisify } from '../../typings/index';
import type { ValidateProto } from './validate';
import type { InterruptPipelineResult } from './pipeline';
import type { Map } from './map';
import type { ErrorReturn } from './error';

type Event = H3.CompatibilityEvent | UnicloudEvent;

let commandArgs = _commandArgs;

// 获取command args
const logMap = getLogger(commandArgs.platform);

// 具体的proto schema引用
let protoSchema: Record<string, Record<string, unknown>> | null = null;

// 支持的methods数组
export const methods: HttpInstructMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];

/**
 * event需要在不同平台之间进行适配
 * @param {Event} event
 * @return {*}  {Promise<{ req: any; res: any; url: string; method: HttpInstructMethod; params: any; query: any }>}
 */
type AdaptEventReturn = Promise<{ key: string; req: any; res: any; url: string; method: HttpInstructMethod; params: any; query: any }>;
export const adaptEvent = async (event: Event): AdaptEventReturn => {
  // 兼容vitest测试环境, 我们需要重新获取正确的command args
  // 在这里需要重新获取的原因是, 我们的adaptEvent测试用例, 显式地传递了command args, 但是在我们开发/生产环境中, commandArgs是一个全局变量, 它只运行一次, 但是测试环境需要获取多次, 所以我们需要重新获取
  // 参考测试用例, test/core/platform.test.ts
  if (process.env.VITEST) {
    commandArgs = parseCommandArgs();
  }
  type Return = Record<Exclude<keyof UnPromisify<AdaptEventReturn>, 'query' | 'key'>, any>;
  const result: Return = (await platformHook<Return>({
    server: async () => {
      const {
        req,
        res,
        req: { url, method }
      } = event as H3.CompatibilityEvent;
      let params = {};
      // 只有在一些有效的方法中，才能解析body
      if (readBodyPayloadMethods.includes(method as unknown as any)) {
        const parseResult = (await h3.useBody(req)) ?? {};
        // 当params是空对象时, 使用usebody解析出来的数据是空字符串, 所以为了validate, 我们需要将空字符串转换为空对象
        if (parseResult !== '') params = parseResult;
      }
      return { req, res, url, method, params };
    },
    unicloud: () => {
      const { route: url, method, params } = event as UnicloudEvent;
      return { req: event, res: null, url, method, params };
    }
  })) as any;
  return {
    ...result,
    query: isJSON(await useQuery(result['url'])),
    // key 就是 url, 在这里需要去掉?号之后部分
    key: result['url'].split('?')[0]
  };
};

/**
 * 处理exec (middleware pipeline)
 * @param {UnPromisify<ReturnType<typeof exec>>} execResult
 * @param {CompatibilityEvent} event
 * @return {*}
 */
const handleExecError = (execResult: UnPromisify<ReturnType<typeof exec>>, event?: Event) => {
  // 判断execresult的类型
  if (execResult instanceof Error) {
    const errorReturn = error('PIPELINE_ERROR', execResult.message);
    return platformHook<ErrorReturn | void>({
      server: () => {
        if (event) {
          return h3.sendError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error);
        }
      },
      unicloud: () => errorReturn
    });
  }
  return true;
};

/**
 * 处理错误的返回
 * @param {ReturnType<typeof validateProto>} validateResult
 * @param {Event} [event]
 * @return {*}
 */
const handleErrorResponse = (validateResult: ReturnType<typeof validateProto>, event?: Event) => {
  const errorReturn = error('VALIDATE_RESPONSE', validateResult.errMsg as string);
  logMap.RESPONSE_TYPE_ERROR(JSON.stringify(validateResult.errMsg));
  return platformHook<ErrorReturn | void>({
    server: () => {
      if (event) {
        return h3.sendError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error);
      }
    },
    unicloud: () => errorReturn
  });
};

/**
 *
 * 处理检查method
 * @param {HttpContext} context
 * @param {CompatibilityEvent} event
 * @param {any} req
 * @return {*}
 */
const handleValidateMethod = async (req: any, event: Event, context: HttpContext) => {
  if (!(await validateMethod(req, context.method))) {
    // 如果校验method错误，就返回错误信息
    const errMsg = `Allowed request methods are: ${context.method.join(',')}, but got: ${req.method}`;
    logMap.REQUEST_METHOD_ERROR(errMsg);
    const errorReturn = error('VALIDATE_METHOD', errMsg);
    return await platformHook<ErrorReturn | void>({
      server: () => {
        if (event) {
          return h3.sendError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error);
        }
      },
      unicloud: () => errorReturn
    });
  }
  return true;
};

/**
 *
 * 处理返回请求头
 * @param {HttpContext} context
 * @param {CompatibilityEvent} event
 */
const handleResHeaders = (context: HttpContext, event?: Event) => {
  if (context.resHeaders) {
    return platformHook({
      server: () => {
        if (event) {
          Object.keys(context.resHeaders).forEach((key) => {
            h3.appendHeader(event as H3.CompatibilityEvent, key, context.resHeaders[key] as string);
          });
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unicloud: () => {}
    });
  }
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
const handleValidateRequestProto = (context: HttpContext, params: ProtoData, query: ProtoData, res: any, cb: () => void) => {
  // 检查请求params的proto
  const requestParamsProtoResult = validateProto(params.proto, params.data);
  // 检查请求query的proto
  const requestQueryProtoResult = validateProto(query.proto, query.data);
  console.log(typeof params.data);
  // 查看请求的参数校验结果，是否有错误
  const errorResult = [requestParamsProtoResult, requestQueryProtoResult].find((v: null | { isSucc: boolean }) => {
    return v && !v.isSucc;
  }) as undefined | { errMsg: string };
  if (errorResult) {
    logMap.REQUEST_TYPE_ERROR(JSON.stringify(errorResult.errMsg));
    handleResHeaders(context, res);
    const errorReturn = error('VALIDATE_REQUEST', errorResult.errMsg);
    return platformHook<ErrorReturn | void>({
      server: () => {
        return h3.sendError(res, errorReturn as H3.H3Error);
      },
      unicloud: () => errorReturn
    });
  } else {
    // proto检测成功的回调
    return cb();
  }
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
 * @param {(HttpContext | InterruptPipelineResult)} context
 * @param {Event} event
 * @return {*}  {({ context: HttpContext; returnData: null | unknown })}
 */
const handlePreApiCall = (
  preApiCallExecResult: HttpContext | InterruptPipelineResult,
  context: HttpContext | InterruptPipelineResult,
  event?: Event
): { context: HttpContext; returnData: null | unknown } => {
  return pipelineResultTypeMap(preApiCallExecResult, context, {
    return: (context, returnData) => {
      handleResHeaders(context, event);
      logMap.RESPONSE_RESULT(JSON.stringify(returnData?.data), '-preApiCall');
      // 直接返回result
      return { context, returnData };
    },
    stop: (context) => {
      handleResHeaders(context, event);
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
 * @param {(HttpContext | InterruptPipelineResult)} context
 * @param {Event} event
 * @return {*}
 */
const handlePostApiCall = (postApiCallExecResult: HttpContext | InterruptPipelineResult, context: HttpContext | InterruptPipelineResult, event?: Event) => {
  return pipelineResultTypeMap(postApiCallExecResult, context, {
    return: (context, returnData) => {
      handleResHeaders(context, event);
      // 直接返回result
      logMap.RESPONSE_RESULT(JSON.stringify(returnData?.data), '-postApiCall');
      return { context, returnData };
    },
    stop: (context) => {
      handleResHeaders(context, event);
      return { context };
    },
    cb: (context) => {
      handleResHeaders(context, event);
      return { context };
    }
  });
};

// 在核心程序中，读取usebody的时候，需要进行判断，只有在几个method的请求上才可以对body进行解析
const readBodyPayloadMethods: HttpInstructMethod[] = ['POST', 'PUT', 'DELETE'];

/**
 *
 * 实现API的装载
 * @param {App} app
 * @param {string} dirName
 */
export const implementApi = async (app: H3.App | null) => {
  // 获取proto schema
  getProtoSchema();
  return platformHook({
    server: async () => {
      if (app) {
        // 获取apimap
        const { apiMap } = await getApiMap();
        const router = h3.createRouter();
        for (const key in apiMap) {
          // key: api value: path
          router.add(
            key,
            async (event: H3.CompatibilityEvent) => serverRouterHandler(key, apiMap, event),
            apiMap[key].method.map((m) => m.toLowerCase()) as any[]
          );
        }
        app.use(router);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unicloud: () => {}
  });
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
  let result = {
    key: context.key as string,
    proto,
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
 * 加载根目录下的protoschema（由cli生成）
 */
const getProtoSchema = async () => {
  const sourcePath = getSourcePath('./src/proto.json');
  const schema = readFileSync(sourcePath).toString();
  if (schema) {
    protoSchema = JSON.parse(schema) as any;
  }
};

/**
 *
 * 通用路由处理函数
 * @param {string} key
 * @param {Record<string, Map>} apiMap
 * @param {CompatibilityEvent} event
 * @return {*}
 */
export const routerHandler = async (key: string, event: Event, apiMap: Record<string, Map>) => {
  // eslint-disable-next-line prefer-const
  let { key: _key, req, res, params, query } = await adaptEvent(event);
  // 将重新处理的key替换
  key = _key;
  // 日志-请求url
  logMap.REQUEST_URL(key);
  params = isJSON(params);
  // 构造context
  let context = createContext({
    key,
    query,
    params,
    reqHeaders: req.headers ?? {},
    resHeaders: {}, // 返回请求头默认为空
    method: apiMap[key].method
  });
  const _res = apiMap[key];
  // 校验method
  const validateMethodResult = await handleValidateMethod(req, event, context);
  if (validateMethodResult !== true) return validateMethodResult;
  // 获取符合要求的proto
  const { ReqParams: reqParamsProto, ReqQuery: reqQueryProto, Res: resProto } = getNeedValidateProto(context.proto);
  // 校验请求proto，如果成功则会执行回调
  return handleValidateRequestProto(context, { proto: reqParamsProto, data: params }, { proto: reqQueryProto, data: query }, res, async () => {
    // 执行pipeline
    const preApiCallExecResult = await exec('preApiCall', context);
    if (handleExecError(preApiCallExecResult, event)) {
      // 如果为true说明pipeline执行没有出错，所以这里判断正确执行的情况
      if (!(preApiCallExecResult instanceof Error)) {
        // 处理PreApiCall Pipline
        const { context: preApiCallContext, returnData: preApiCallReturnData } = handlePreApiCall(preApiCallExecResult, context, event);
        // 判断returndata是否存在, 如果存在，则直接返回
        if (preApiCallReturnData) return preApiCallReturnData;
        // 经过pipeline后的context需要重新赋值
        context = preApiCallContext;
        logMap.REQUEST_QUERY(JSON.stringify(context.query));
        logMap.REQUEST_PARAMS(JSON.stringify(context.params));
        // 执行handler
        const _handlerRes = await _res.handler(context);
        // 执行pipeline
        const postApiCallExecResult = await exec('postApiCall', context);
        if (handleExecError(postApiCallExecResult, event)) {
          if (!(postApiCallExecResult instanceof Error)) {
            const { returnData: postApiCallReturnData } = handlePostApiCall(postApiCallExecResult, context, event);
            if (postApiCallReturnData) return postApiCallReturnData;
            // 校验返回结果是否符合预期
            const resProtoResult = validateProto(resProto, (_handlerRes as any) || {});
            if (!resProtoResult.isSucc) {
              // 如果返回结果不符合预期，就抛出错误
              return handleErrorResponse(resProtoResult, event);
            }
          }
        }
        logMap.RESPONSE_RESULT(typeof _handlerRes === 'undefined' ? '{}' : JSON.stringify(_handlerRes));
        return _handlerRes;
      }
    }
  });
};

/**
 *
 * server端路由处理器
 * @param {string} key
 * @param {Record<string, Map>} apiMap
 * @param {H3.CompatibilityEvent} event
 * @return {*}
 */
const serverRouterHandler = (key: string, apiMap: Record<string, Map>, event: H3.CompatibilityEvent) => {
  return routerHandler(key, event, apiMap);
};
