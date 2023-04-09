export const renderProtoCode = () => `export interface ReqParams {}
export interface ReqQuery {}
export interface Res {
  message: string;
}`;

export const renderApiCode = () => `import { useApi } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: async (ctx) => {
    return {
      message: 'hello'
    };
  }
});`;
