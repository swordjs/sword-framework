import { useApi } from '@sword-code-practice/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export default useApi<{
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
