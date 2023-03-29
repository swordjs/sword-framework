import { aggregatePlugin } from './plugin';
import type { Plugin } from '~types/index';
import type { Logger } from '~types/log';

export const log: () => Required<Plugin>['log'] = () => aggregatePlugin!.log.plugin;

/**
 *
 * 区分不同环境获取不同的log实现
 * @return {*}  {Logger}
 */
export const getLogger = (): Logger => {
  return {
    REQUEST_URL: (key: string) => log().info(`[请求URL]: ${key}`),
    REQUEST_METHOD_ERROR: (msg: string) => log().err(`[请求方法错误]: ${msg}`),
    REQUEST_TYPE_ERROR: (msg: string) => log().err(`[请求类型校验错误]:${msg}`),
    REQUEST_QUERY: (query: string) => log().info(`[请求参数-query]: ${query}`),
    REQUEST_PARAMS: (query: string) => log().info(`[请求参数-params]: ${query}`),
    EXECUTE_ERROR: (msg: string) => log().err(`[handler执行错误]: ${msg}`),
    RESPONSE_RESULT: (msg: string, suffix = '') => log().info(`[返回结果${suffix}]: ${msg}`),
    RESPONSE_TYPE_ERROR: (msg: string) => log().err(`[返回类型校验错误]:${msg}`)
  };
};
