import Ajv, { JSONSchemaType } from 'ajv';
import { routerHandler, methods } from '../../api';
import error from '../../error';
import { httpStatusCorrect } from '~util/api';
import type { Event, CustomHandlerReturn, HttpApiStatusResponse, RouterHandlerOptions } from '#types/index';
import type { UnicloudOriginContext, UnicloudEvent } from '#types/unicloud';
import type { Map } from '../../map';

export const adaptUnicloudEvent = async (event: Event) => {
  const { route: url, method, params } = event as UnicloudEvent;
  return { req: event, res: null, key: url, method, params };
};

/**
 *
 * 返回unicloud响应 (云函数url化 / 普通调用)
 * @param {ReturnType<CustomHandlerReturn>} res
 * @param {RouterHandlerOptions['unicloud']} [options]
 * @return {*}
 */
export const unicloudResponse = (res: Partial<ReturnType<CustomHandlerReturn>>, options?: RouterHandlerOptions['unicloud']) => {
  // unicloud是否是云函数url化, 默认是
  const urlized = options?.urlized ?? true;
  // 判断状态码
  const successStatus = res.statusCode ? httpStatusCorrect(res.statusCode as number) : true;
  // 根据状态码返回相应的响应
  const returnData = successStatus
    ? res.data
    : {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        data: res.data
      };
  // 如果是云函数url化，则需要将返回的数据转换为云函数url化的数据
  if (urlized) {
    return {
      mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
      isBase64Encoded: false, // 硬编码
      statusCode: res.statusCode,
      // 如果状态正常就直接返回res.data, 否则就要返回错误信息
      body: JSON.stringify(returnData),
      headers: res.headers
    };
  }
  return returnData;
};

// 判断是否是云函数url化
export const isUnicloudUrlized = (context: UnicloudOriginContext) => {
  return context.SOURCE === 'http';
};

/**
 *
 * unicloud 平台触发api
 * @param {UnicloudEvent} event
 * @param {Record<string, Map>} apiMap
 * @return {*}
 */
export const triggerApi = async (event: UnicloudEvent, context: UnicloudOriginContext, apiMap: Record<string, Map>) => {
  // 判断apimap是否存在指定的route
  // route需要取问号之前有效的路径
  const route = event.route.split('?')[0];
  const unicloudRouterOptions: RouterHandlerOptions = {
    unicloud: {
      urlized: isUnicloudUrlized(context)
    }
  };
  if (!apiMap[route]) {
    return error('NOT_FOUND', `route ${route} not found`, null, unicloudRouterOptions);
  }
  const [result, customResult] = (await routerHandler(event.route, event, apiMap, unicloudRouterOptions)) as unknown as [
    any,
    Required<ReturnType<CustomHandlerReturn>> | undefined
  ];
  return unicloudResponse(
    // 如果不是集成响应, 就仅传递一个data
    customResult ?? {
      data: result
    },
    unicloudRouterOptions.unicloud
  );
};

/**
 *
 * 校验event
 * @param {UnicloudEvent} event
 * @return {*}  {(Promise<HttpApiStatusResponse | true>)}
 */
export const validateEvent = async (event: UnicloudEvent, context: UnicloudOriginContext): Promise<HttpApiStatusResponse | true> => {
  const ajv = new Ajv();
  const schema: JSONSchemaType<UnicloudEvent> = {
    type: 'object',
    properties: {
      route: { type: 'string' },
      method: { type: 'string', pattern: methods.join('|') },
      query: { type: 'object' },
      params: { type: 'object' }
    },
    required: ['method', 'params', 'query', 'route'],
    additionalProperties: false
  };
  const validateResult = ajv.compile(schema)(event);
  if (!validateResult) {
    // 触发错误事件, 需要传递option, 指定当前unicloud的调用环境 (是否是云函数url化)
    return await error('VALIDATE_REQUEST', 'event is not valid (unicloud)', null, {
      unicloud: {
        urlized: isUnicloudUrlized(context)
      }
    });
  }
  return true;
};
