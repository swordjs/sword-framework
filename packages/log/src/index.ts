import chalk from 'chalk';
import type { Plugin } from '#types/index';
import type { LogType } from '#types/log';

const now = () => {
  const _ = new Date();
  return `${_.getFullYear()}-${_.getMonth() + 1}-${_.getDate()} ${_.getHours()}:${_.getMinutes()}:${_.getSeconds()}`;
};

export const log: LogType = {
  err: (v: string | Error): void => {
    console.log(`${chalk.gray(now())} ${v}`);
  },
  info: (v: string): void => {
    console.log(`${chalk.gray(now())} ${chalk.yellow(v)}`);
  },
  success: (v: string): void => {
    console.log(`${chalk.gray(now())} ${chalk.green(v)}`);
  }
};

/**
 * 定义终端打印日志插件
 * @preset true
 * @return {*}
 */
export const useLog = (): Plugin => {
  return {
    name: 'log',
    log
  };
};
