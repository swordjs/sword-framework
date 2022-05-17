import { getQuery, QueryObject } from 'ufo';

/**
 *
 * 获取query参数
 * @param {string} url
 * @return {*}  {QueryObject}
 */
export const useQuery = (url: string): QueryObject => {
  return getQuery(url);
};
