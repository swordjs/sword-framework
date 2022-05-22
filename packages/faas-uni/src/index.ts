import type { UnicloudContext, UnicloudEvent } from '../../../typings/unicloud';
import type { Logger } from '../../../typings/log';
import type { Map } from '../../../src/core/map';

/**
 * unicloud 平台触发api
 * @param {UnicloudEvent} event
 * @param {UnicloudContext} context
 * @return {*}
 */
export const triggerApi = (event: UnicloudEvent, context: UnicloudContext, apiMap: Record<string, Map>) => {
  console.log(apiMap);
  return '';
};

export const logger: Logger = {
  REQUEST_URL: (key: string) => console.log(`[请求URL]: ${key}`),
  REQUEST_METHOD_ERROR: (msg: string) => console.log(`[请求方法错误]: ${msg}`),
  REQUEST_TYPE_ERROR: (msg: string) => console.log(`[请求类型校验错误]:${msg}`),
  REQUEST_QUERY: (query: string) => console.log(`[请求参数-query]: ${query}`),
  REQUEST_PARAMS: (query: string) => console.log(`[请求参数-params]: ${query}`),
  RESPONSE_RESULT: (msg: string, suffix = '') => console.log(`[返回结果${suffix}]: ${msg}`),
  RESPONSE_TYPE_ERROR: (msg: string) => console.log(`[返回类型校验错误]:${msg}`)
};
