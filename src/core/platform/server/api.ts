import { routerHandler } from '../../api';
import { getAsyncDependency } from '../../schedule';
import type { Map } from '../../map';
import type H3 from '@sword-code-practice/h3';
import type { Event } from '../../../../typings/index';
import type { HttpInstructMethod } from '../../../../typings/index';

// 在核心程序中，读取usebody的时候，需要进行判断，只有在几个method的请求上才可以对body进行解析
const readBodyPayloadMethods: HttpInstructMethod[] = ['POST', 'PUT', 'DELETE'];

export const adaptServerEvent = async (event: Event) => {
  const {
    req,
    res,
    req: { url, method }
  } = event as H3.CompatibilityEvent;
  let params = {};
  // 只有在一些有效的方法中，才能解析body
  if (readBodyPayloadMethods.includes(method as unknown as any)) {
    const parseResult = (await getAsyncDependency<typeof H3>('@sword-code-practice/h3').useBody(req)) ?? {};
    // 当params是空对象时, 使用usebody解析出来的数据是空字符串, 所以为了validate, 我们需要将空字符串转换为空对象
    if (parseResult !== '') params = parseResult;
  }
  return { req, res, key: url, method, params };
};

/**
 *
 * server端路由处理器
 * @param {string} key
 * @param {Record<string, Map>} apiMap
 * @param {H3.CompatibilityEvent} event
 * @return {*}
 */
export const serverRouterHandler = (key: string, apiMap: Record<string, Map>, event: H3.CompatibilityEvent) => {
  return routerHandler(key, event, apiMap);
};
