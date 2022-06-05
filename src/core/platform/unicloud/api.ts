import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { routerHandler, methods } from '../../api';
import error from '../../error';
import type { Event } from '../../../../typings/index';
import type { UnicloudContext, UnicloudEvent } from '../../../../typings/unicloud';
import type { Map } from '../../map';
import type { ErrorReturn } from '../../error';

export const adaptUnicloudEvent = async (event: Event) => {
  const { route: url, method, params } = event as UnicloudEvent;
  return { req: event, res: null, key: url, method, params };
};

/**
 *
 * unicloud 平台触发api
 * @param {UnicloudEvent} event
 * @param {Record<string, Map>} apiMap
 * @return {*}
 */
export const triggerApi = (event: UnicloudEvent, context: UnicloudContext, apiMap: Record<string, Map>) => {
  // 判断apimap是否存在指定的route
  // route需要取问号之前有效的路径
  const route = event.route.split('?')[0];
  if (!apiMap[route]) {
    return error('NOT_FOUND', `route ${route} not found`);
  }
  return routerHandler(event.route, event, apiMap);
};

/**
 *
 * 校验event
 * @param {UnicloudEvent} event
 */
export const validateEvent = (event: UnicloudEvent): ErrorReturn | true => {
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
    return error('VALIDATE_REQUEST', 'event is not valid (unicloud)');
  }
  return true;
};
