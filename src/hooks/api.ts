import type { HttpInstructReturn, HttpApiHandler, HttpInstructMethod, HttpApiReturn, ContextData } from '@sword-code-practice/types/sword-backend-framework';

/**
 * 创建API
 * @description 你可以用`useApi`来快速创建一个api，
 * 这个api默认是get请求，如果你没有指定指示器的话，你可以在`useApi`中
 * 传入一个指示器，这个指示器代表了请求的方法和路由
 * @template C
 * @example
 *
 * import { useApi } from "@sword-code-practice/backend-framework";
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
  let {
    instruct = {
      method: 'GET'
    }
  } = params;
  // 对指示器做一下输出处理，避免编译器做过多逻辑
  let path;
  let method: HttpInstructMethod[] = [];
  // 判断是否传递了指示器
  // 如果传递了多个指示器
  if (Array.isArray(instruct)) {
    // 对instruct进行过滤，将非法的错误进行排除
    instruct = instruct.filter((i) => i.path && i.path.trim() !== '');
    if (instruct.length === 0) {
      // 如果传入了一个空数组，就默认给一个method
      method.push('GET');
    } else {
      // 取出method，并且进行去重复
      method = [...new Set(instruct.map((i) => i.method))];
      path = instruct[0].path;
    }
  } else {
    // 如果仅仅传入了一个指示器，那么直接对method和path做处理
    method.push(instruct.method);
    if (instruct.path && instruct.path.trim() !== '') path = instruct.path;
  }
  return {
    instruct: {
      method,
      path
    },
    handler: params.handler
  };
};
