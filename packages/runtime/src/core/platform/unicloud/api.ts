import Ajv, { JSONSchemaType } from 'ajv';
import { routerHandler, methods } from '../../api';
import error from '../../error';
import type { Event, CustomHandlerReturn, HttpApiStatusResponse } from '../../../../../../typings/index';
import type { UnicloudOriginContext, UnicloudEvent } from '../../../../../../typings/unicloud';
import type { Map } from '../../map';

export const adaptUnicloudEvent = async (event: Event) => {
  const { route: url, method, params } = event as UnicloudEvent;
  return { req: event, res: null, key: url, method, params };
};

/**
 *
 * 返回unicloud集成响应 (云函数url化)
 * @param {ReturnType<CustomHandlerReturn>} res
 * @return {*}
 */
export const unicloudIntegratedResponse = async (
  res: ReturnType<CustomHandlerReturn>,
  options?: {
    urlized?: boolean;
  }
) => {
  // unicloud是否是云函数url化
  const urlized = options?.urlized ?? true;
  // 如果是云函数url化，则需要将返回的数据转换为云函数url化的数据
  if (urlized) {
    return {
      mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
      isBase64Encoded: false, // 硬编码
      statusCode: res.statusCode,
      data: res,
      headers: res.headers
    };
  }
  return res;
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
  if (!apiMap[route]) {
    return error('NOT_FOUND', `route ${route} not found`);
  }
  const handlerResult = await routerHandler(event.route, event, apiMap);
  const [result, customResult] = handlerResult as unknown as [any, ReturnType<CustomHandlerReturn> | undefined];
  if (context.SOURCE === 'http') {
    // 判断, 如果是函数url化, 就返回一个集成响应
    // 判断路由返回结果类型
    if (Array.isArray(handlerResult)) {
      // 如果customResult存在
      if (customResult) return unicloudIntegratedResponse(customResult);
    }
  }
  return result;
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
    // 触发错误事件
    return await error('VALIDATE_REQUEST', 'event is not valid (unicloud)', null, {
      unicloud: {
        urlized: context.SOURCE === 'http'
      }
    });
  }
  return true;
};
