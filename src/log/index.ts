import chalk from 'chalk';

const now = () => {
  const _ = new Date();
  return `${_.getFullYear()}-${_.getMonth() + 1}-${_.getDate()} ${_.getHours()}:${_.getMinutes()}:${_.getSeconds()}`;
};

/**
 * 终端打印日志
 * @return {*}
 */
export default {
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
