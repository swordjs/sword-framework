import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { routerHandler, methods } from '../api';
import error from '../error';
import type { UnicloudContext, UnicloudEvent } from '../../../typings/unicloud';
import type { Map } from '../map';

/**
 *
 * unicloud 平台触发api
 * @param {UnicloudEvent} event
 * @param {Record<string, Map>} apiMap
 * @return {*}
 */
export const triggerApi = (event: UnicloudEvent, context: UnicloudContext, apiMap: Record<string, Map>) => {
  const validateResult = validateEvent()(event);
  if (!validateResult) {
    return error('VALIDATE_REQUEST', 'event is not valid (unicloud)');
  }
  // 判断apimap是否存在指定的route
  const route = event.route;
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
export const validateEvent = (): ValidateFunction<UnicloudEvent> => {
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
  return ajv.compile(schema);
};
