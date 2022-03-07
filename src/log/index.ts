import consola from 'consola';
import chalk from 'chalk';
import dayjs from 'dayjs';

const now = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 终端打印日志
 * @return {*}
 */
export default {
  err: (v: string | Error) => {
    consola.error(`${chalk.gray(now())} ${v}`);
  },
  info: (v: string) => {
    consola.info(`${chalk.gray(now())} ${chalk.yellow(v)}`);
  },
  success: (v: string) => {
    consola.success(`${chalk.gray(now())} ${chalk.green(v)}`);
  }
};
