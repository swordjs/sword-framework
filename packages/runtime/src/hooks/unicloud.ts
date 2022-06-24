import { triggerApi, validateEvent } from '../core/platform/unicloud/api';
import { asyncDependencyScheduler } from '../core/schedule';
import { aggregatePluginBehavior } from '../core/plugin';
import { isJSON } from '../../../../util/data';
import type { UnicloudOriginContext, UnicloudUrlOriginEvent, UnicloudEvent } from '../../../../typings/unicloud';

export let unicloudOriginContext: UnicloudOriginContext;
export let unicloudOriginUrlEvent: UnicloudUrlOriginEvent;

export const useUnicloudApp = async (
  event: unknown,
  context: UnicloudOriginContext
): Promise<{
  event: UnicloudEvent;
  context: UnicloudOriginContext;
}> => {
  // 执行异步依赖调度
  await asyncDependencyScheduler();
  // 聚合插件
  await aggregatePluginBehavior();
  unicloudOriginContext = context;
  // 判断是否是函数url化
  if (context.SOURCE === 'http') {
    // 那么event就是集成请求
    unicloudOriginUrlEvent = event as UnicloudUrlOriginEvent;
    // 判断是否是base64编码
    if (unicloudOriginUrlEvent.isBase64Encoded) {
      // 对body进行base64解码
      unicloudOriginUrlEvent.body = Buffer.from(unicloudOriginUrlEvent.body, 'base64').toString();
    }
  }
  return {
    event:
      context.SOURCE === 'http'
        ? {
            route: unicloudOriginUrlEvent.path,
            method: unicloudOriginUrlEvent.httpMethod as any,
            query: unicloudOriginUrlEvent.queryStringParameters,
            // body如果是空字符串, 就给一个空对象, 反之需要isJSON转换
            params: unicloudOriginUrlEvent.body === '' ? {} : (isJSON(unicloudOriginUrlEvent.body) as any)
          }
        : (event as UnicloudEvent),
    context: unicloudOriginContext
  };
};

export const useUnicloudTriggerApi = triggerApi;
export const useUnicloudValidateEvent = validateEvent;
export const useUnicloudContext = (): UnicloudOriginContext => unicloudOriginContext;
export const useUnicloudUrlEvent = (): UnicloudUrlOriginEvent | undefined => unicloudOriginUrlEvent;
