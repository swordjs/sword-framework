export type UnicloudContext = {
  APPID?: string;
  SOURCE: string;
  CLIENTIP: string;
  CLIENTUA: string;
  OS?: undefined;
  PLATFORM?: undefined;
  SPACEINFO: {
    provider: 'aliyun' | 'tencent';
    spaceId: string;
  };
  DEVICEID?: undefined;
  FUNCTION_NAME: string;
  LOCALE?: undefined;
};

export type UnicloudEvent = {
  route: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
};
