type UnicloudContext = {
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

/**
 *
 * 使用unicloud app 利用此api获取其上下文
 * @param {Record<string, unknown>} event
 * @param {UnicloudContext} context
 */
export const useUnicloudApp = (event: Record<string, unknown>, context: UnicloudContext) => {
  console.log(event, context);
};
