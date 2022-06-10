import type { Plugin } from '../../../typings/index';
import type { LogType } from '../../../typings/log';

export const log: LogType = {
  err: (v: string | Error): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    uniCloud.logger.error(v);
  },
  info: (v: string): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    uniCloud.logger.info(v);
  },
  success: (v: string): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    uniCloud.logger.log(v);
  }
};

/**
 * 定义unicloud平台的log
 * @return {*}
 */
export const useLog = (): Plugin => {
  return {
    name: 'unicloud-log',
    log
  };
};
