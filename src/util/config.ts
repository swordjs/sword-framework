import mri from 'mri';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../typings/config';

let argv: any = null;

// 用于解析命令行参数, 附带一个默认command默认对象
export const parseCommandArgs = (): Argv<CommandConfig> => {
  const defaultArgs: CommandConfig = {
    platform: 'server'
  };
  // 如果是测试环境, 即vitest环境, 我们需要将env的参数进行解析, 优先使用env
  if (process.env.VITEST) {
    // 从默认的参数中提取
    let key: keyof typeof defaultArgs;
    for (key in defaultArgs) {
      if (process.env[key]) {
        defaultArgs[key] = process.env[key] as any;
      }
    }
    argv = { _: [], ...defaultArgs };
  } else {
    if (argv) {
      return argv;
    }
    argv = mri<CommandConfig>(process.argv.slice(2), {
      default: defaultArgs
    });
  }
  return argv;
};

export const commandArgs = parseCommandArgs();
