export const renderUnicloudIndexCode = () => `module.exports = async (e, c) => {
    let { event, context } = await import_sword_framework.useUnicloudApp(e, c);
    const validateResult = await import_sword_framework.useUnicloudValidateEvent(event, context);
    if (validateResult !== true) {
      return validateResult;
    }
    const { apiMap } = await import_sword_framework.useGetApiMap({
      apiPath: event.route.split("?")[0]
    })
    return await import_sword_framework.useUnicloudTriggerApi(event, context, apiMap)
  }`;
