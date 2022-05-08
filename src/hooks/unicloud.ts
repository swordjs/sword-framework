import { setContext, setEvent } from '../core/platform/unicloud';
import type { UnicloudContext, UnicloudEvent } from '../../typings/unicloud';

/**
 *
 * 使用unicloud app 利用此api获取其上下文
 * @param {UnicloudEvent} event
 * @param {UnicloudContext} context
 */
export const useUnicloudApp = (event: UnicloudEvent, context: UnicloudContext): void => {
  setContext(context);
  setEvent(event);
};
