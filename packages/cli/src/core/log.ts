import consola from 'consola';
import chalk from 'chalk';

/**
 * Terminal Print Log
 * @return {*}
 */
export default {
  err: (v: string | Error) => {
    consola.error(v);
  },
  info: (v: string) => {
    consola.info(chalk.yellow(v));
  },
  success: (v: string) => {
    consola.success(v);
  }
};
