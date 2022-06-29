import { useApi } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export default useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: async (ctx) => {
    return {
      message: 'hello world'
    };
  }
});
