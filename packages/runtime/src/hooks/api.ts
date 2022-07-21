import type { HttpInstructReturn, HttpApiHandler, HttpApiInstructReturn, HttpApiReturn, ContextData } from '#types/index';

/**
 *
 * 判断path是否合格
 * @param {string} path
 * @return {*}  {(string | undefined)}
 */
const checkPath = (path: HttpInstructReturn['path']): HttpInstructReturn['path'] | undefined => {
  if (path && path.trim() !== '' && path[0] === '/') return path;
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
  const instructMap: HttpApiInstructReturn = new Map();
  // 判断是否传递了指示器, 如果没有传递指示器，那么默认是get请求
  if (!instruct || (Array.isArray(instruct) && instruct.length === 0)) {
    // type是文件系统路由
    instructMap.set(undefined, { type: 'mandatory', methods: new Set(['GET']) });
  } else if (Array.isArray(instruct)) {
    instruct.map((i) => {
      // path合法性
      const isPath = checkPath(i.path);
      instructMap.set(isPath, { methods: (instructMap.get(isPath)?.methods || new Set()).add(i.method), type: isPath ? 'mandatory' : 'file-system' });
    });
  } else if (instruct) {
    // 如果仅仅传入了一个指示器，那么直接对method和path做处理
    const isPath = checkPath(instruct.path);
    instructMap.set(isPath, { methods: new Set([instruct.method]), type: isPath ? 'mandatory' : 'file-system' });
  }
  return {
    instruct: instructMap,
    handler: params.handler
  };
};
