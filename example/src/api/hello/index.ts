import { useApi } from '@sword-code-practice/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: (ctx) => {
    return {
      message: 'hello'
    };
  }
});
