import { ReqQuery, ReqParams, Res } from './proto';

export default useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  // TODO 直接传入一个函数，而不是handler
  handler: async (ctx) => {
    return {
      message: 'hello world'
    };
  }
});
