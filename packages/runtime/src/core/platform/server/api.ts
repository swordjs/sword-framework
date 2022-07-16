import { routerHandler } from '../../api';
import { getAsyncDependency } from '../../schedule';
import error from '../../error';
import { getApiMap } from '../../map';
import { httpStatusCorrect } from '~util/api';
import type { Map } from '../../map';
import type * as H3 from '@swordjs/h3';
import type { Event, HttpContext, HttpInstructMethod, CustomHandlerReturn } from '#types/index';

// 在核心程序中，读取usebody的时候，需要进行判断，只有在几个method的请求上才可以对body进行解析
const readBodyPayloadMethods: HttpInstructMethod[] = ['POST', 'PUT', 'DELETE'];

/**
 *
 * 适配event
 * @param {Event} event
 * @return {*}
 */
export const adaptEvent = async (event: Event) => {
  const {
    req,
    res,
    req: { url, method }
  } = event as H3.CompatibilityEvent;
  let params = {};
  // 只有在一些有效的方法中，才能解析body
  if (readBodyPayloadMethods.includes(method as unknown as any)) {
    const parseResult = (await getAsyncDependency<typeof H3>('@swordjs/h3').useBody(req)) ?? {};
    // 当params是空对象时, 使用usebody解析出来的数据是空字符串, 所以为了validate, 我们需要将空字符串转换为空对象
    if (parseResult !== '') params = parseResult;
  }
  return { req, res, key: url, method, params };
};

/**
 *
 * 集中处理server的h3错误
 * @param {H3.CompatibilityEvent} [event]
 * @param {H3.H3Error} errorReturn
 * @return {*}
 */
export const apiError = async (event: H3.CompatibilityEvent, errorReturn?: H3.H3Error): Promise<void> => {
  const h3 = await getAsyncDependency<typeof H3>('@swordjs/h3');
  return h3.sendError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error);
};

/**
 *
 * 处理返回请求头
 * @param {H3.CompatibilityEvent} event
 * @param {HttpContext['resHeaders']} headers
 * @return {*}  {Promise<void>}
 */
export const apiResponseHeaders = async (event: H3.CompatibilityEvent, headers: HttpContext['resHeaders']): Promise<void> => {
  const h3 = await getAsyncDependency<typeof H3>('@swordjs/h3');
  Object.keys(headers).forEach((key) => {
    h3.appendHeader(event as H3.CompatibilityEvent, key, headers[key] as string);
  });
};

/**
 *
 * 实现api
 * @param {(H3.App | null)} app
 * @return {*}  {(Promise<typeof H3 | null>)}
 */
export const implementApi = async (app: H3.App | null): Promise<typeof H3 | null> => {
  if (app) {
    const h3 = await getAsyncDependency<typeof H3>('@swordjs/h3');
    // 获取apimap
    const { apiMap } = await getApiMap();
    const router = h3.createRouter();
    for (const key in apiMap) {
      // key: api value: path
      router.add(
        key,
        async (event: H3.CompatibilityEvent) => await serverRouterHandler(key, apiMap, event),
        apiMap[key].method.map((m) => m.toLowerCase()) as any[]
      );
    }
    app.use(router);
    return h3;
  }
  return null;
};

/**
 *
 * 处理集成返回
 * @param {H3.CompatibilityEvent} event
 * @param {number} statusCode
 * @param {string} statusMessage
 * @param {*} data
 * @return {*}
 */
export const customApiReturn = async (event: H3.CompatibilityEvent, statusCode: number, statusMessage: string, data: any) => {
  const h3: typeof H3 = await getAsyncDependency<typeof H3>('@swordjs/h3');
  // 判断状态码不等于2xx, 就返回一个server错误
  if (!httpStatusCorrect(statusCode)) {
    // 调用error
    const errorReturn = await error(statusCode, statusMessage, data);
    h3.sendError(event as H3.CompatibilityEvent, errorReturn as H3.H3Error);
    return false;
  } else {
    // 虽然是正确的状态码(2xx),仍然需要指定当前会话中的status和message
    event.res.statusCode = statusCode;
    event.res.statusMessage = statusMessage;
  }
};

/**
 *
 * server端路由处理器
 * @param {string} key
 * @param {Record<string, Map>} apiMap
 * @param {H3.CompatibilityEvent} event
 * @return {*}
 */
export const serverRouterHandler = async (key: string, apiMap: Record<string, Map>, event: H3.CompatibilityEvent) => {
  const [result, customResult] = (await routerHandler(key, event, apiMap)) as unknown as [any, Required<ReturnType<CustomHandlerReturn>> | undefined];
  if (customResult) {
    // 如果是集成返回, 就要经过customApiReturn
    const customApiReturnResult = await customApiReturn(event, customResult.statusCode, customResult.statusMessage, customResult.data);
    if (customApiReturnResult !== false) {
      // 如果是正常的集成返回, 则就返回data
      return result;
    }
  }
  // 直接返回data
  return result;
};
