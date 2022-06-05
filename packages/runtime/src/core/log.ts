import { aggregatePlugin } from './plugin';
import type { Plugin } from '../../../../typings/index';
import type { Logger } from '../../../../typings/log';
import type { CommandConfig } from '../../../../typings/config';

// log模块不会为空，因为log模块就算用户没有注册，也会有一个默认的log模块
export const log: () => Required<Plugin>['log'] = () => {
  return aggregatePlugin ? aggregatePlugin.log.plugin : {};
};

/**
 *
 * 区分不同环境获取不同的log实现
 * @param {CommandConfig['platform']} platform
 * @return {*}  {Logger}
 */
export const getLogger = (platform: CommandConfig['platform']): Logger => {
  const map: Record<typeof platform, Logger> = {
    server: {
      REQUEST_URL: (key: string) => log().info(`[请求URL]: ${key}`),
      REQUEST_METHOD_ERROR: (msg: string) => log().err(`[请求方法错误]: ${msg}`),
      REQUEST_TYPE_ERROR: (msg: string) => log().err(`[请求类型校验错误]:${msg}`),
      REQUEST_QUERY: (query: string) => log().info(`[请求参数-query]: ${query}`),
      REQUEST_PARAMS: (query: string) => log().info(`[请求参数-params]: ${query}`),
      RESPONSE_RESULT: (msg: string, suffix = '') => log().info(`[返回结果${suffix}]: ${msg}`),
      RESPONSE_TYPE_ERROR: (msg: string) => log().err(`[返回类型校验错误]:${msg}`)
    },
    unicloud: unicloudLogger
  };
  return map[platform];
};

export const unicloudLogger: Logger = {
  REQUEST_URL: (key: string) => console.log(`[请求URL]: ${key}`),
  REQUEST_METHOD_ERROR: (msg: string) => console.log(`[请求方法错误]: ${msg}`),
  REQUEST_TYPE_ERROR: (msg: string) => console.log(`[请求类型校验错误]:${msg}`),
  REQUEST_QUERY: (query: string) => console.log(`[请求参数-query]: ${query}`),
  REQUEST_PARAMS: (query: string) => console.log(`[请求参数-params]: ${query}`),
  RESPONSE_RESULT: (msg: string, suffix = '') => console.log(`[返回结果${suffix}]: ${msg}`),
  RESPONSE_TYPE_ERROR: (msg: string) => console.log(`[返回类型校验错误]:${msg}`)
};
