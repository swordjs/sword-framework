import mri from 'mri';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../typings/config';

let argv: any = null;

// 用于解析命令行参数, 附带一个默认command默认对象
export const parseCommandArgs = (): Argv<CommandConfig> => {
  if (argv) {
    return argv;
  }
  argv = mri<CommandConfig>(process.argv.slice(2), {
    default: {
      platform: 'server'
    }
  });
  return argv;
};
