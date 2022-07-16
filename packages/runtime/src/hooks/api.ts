import type { HttpInstructReturn, HttpApiHandler, HttpInstructMethod, HttpApiReturn, ContextData } from '#types/index';

// 判断path是否合格
const checkPath = (path: HttpInstructReturn['path']) => {
  if (path) return Boolean(path && path.trim() !== '' && path[0] === '/');
  return false;
};

/**
 * 创建API
 * @description 你可以用`useApi`来快速创建一个api，
 * 这个api默认是get请求，如果你没有指定指示器的话，你可以在`useApi`中
 * 传入一个指示器，这个指示器代表了请求的方法和路由
 * @template C
 * @example
 *
 * import { useApi } from "@swordjs/backend-framework";
 * import { ReqQuery, ReqParams, Res } from "./proto";
 * export const main = useApi<{
 *  query: ReqQuery;
 *  params: ReqParams;
 *  res: Res;
 *}>({
 *  handler: (ctx) => {
 *    return {
 *      name: "1",
 *    };
 *  },
  });
 * @param {({
 *   instruct?: HttpInstructReturn | HttpInstructReturn[];
 *   handler: HttpApiHandler<C>;
 * })} params
 * @return {*}  {HttpApiReturn<C>}
 */
export const useApi = <C extends ContextData>(params: {
  instruct?: HttpInstructReturn | HttpInstructReturn[];
  handler: HttpApiHandler<C>;
}): HttpApiReturn<C> => {
  const { instruct } = params;
  const method = new Set<HttpInstructMethod>();
  let path: string | undefined;
  // 判断是否传递了指示器, 如果没有传递指示器，那么默认是get请求
  if (!instruct) method.add('GET');
  // 如果传递了多个指示器
  if (Array.isArray(instruct)) {
    instruct.map((i) => {
      method.add(i.method);
      if (checkPath(i.path)) {
        if (!path) {
          path = i.path;
        }
        method.add(i.method);
      }
    });
    // 如果指示器数组为空，那么默认是get请求
    if (instruct.length === 0) method.add('GET');
  } else if (instruct) {
    // 如果仅仅传入了一个指示器，那么直接对method和path做处理
    method.add(instruct.method);
    if (checkPath(instruct.path)) path = instruct.path;
  }
  return {
    instruct: {
      method: [...method],
      path
    },
    handler: params.handler
  };
};
