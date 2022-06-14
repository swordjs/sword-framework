import type { HttpInstructMethod } from './index';

export type UnicloudOriginContext = {
  APPID?: string;
  SOURCE: 'server' | 'http' | 'client';
  CLIENTIP: string;
  CLIENTUA: string;
  OS?: unknown;
  PLATFORM?: unknown;
  SPACEINFO: {
    provider: 'aliyun' | 'tencent';
    spaceId: string;
  };
  DEVICEID?: undefined;
  FUNCTION_NAME: string;
  LOCALE?: unknown;
};

// unicloud应用云函数url化之后的“集成请求”
export type UnicloudUrlOriginEvent = {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  isBase64Encoded: boolean;
  body: string;
};

export type UnicloudEvent = {
  route: string;
  method: HttpInstructMethod;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
};
