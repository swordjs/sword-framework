import { useApi } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export default useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: async (ctx) => {
    return () => {
      return {
        statusCode: 205,
        statusMessage: 'success',
        headers: {
          fuck: '666'
        },
        data: {
          message: 'Hello, World!'
        }
      };
    };
  }
});
