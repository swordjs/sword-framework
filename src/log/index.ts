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
  err: (v: string | Error) => {
    console.log(`${chalk.gray(now())} ${v}`);
  },
  info: (v: string) => {
    console.log(`${chalk.gray(now())} ${chalk.yellow(v)}`);
  },
  success: (v: string) => {
    console.log(`${chalk.gray(now())} ${chalk.green(v)}`);
  }
};
