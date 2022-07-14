/**
 *
 * 获取map的存储key
 * @example
 *
 *  // 获取map的key的函数, 支持传入一个prefix(api), apipath, path
 *  // 会优先使用path, 如果没有则会使用默认的apipath
 *  // 这个函数通常会作用于runtime和cli的map-key
 *  // 在useApi中可以指定apiurl, 如果没有指定则会使用默认的(文件系统即参数path)
 *  const currentPath = getKey(`/${apiDir}`, apiPath, instruct.path);
 *
 * @param {string} urlPrefix
 * @param {string} apiPath
 * @param {string} [path]
 * @return {*}
 */
export const getKey = (urlPrefix: string, apiPath: string, path?: string) => {
  return `${urlPrefix}${path ? path : apiPath}`;
};
