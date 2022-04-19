import mri from 'mri';
import type { CommandConfig } from '../../typings/config';

// 用于解析命令行参数, 附带一个默认command默认对象
export const parseCommandArgs = () => {
  return mri<CommandConfig>(process.argv.splice(2), {
    default: {
      platform: 'server'
    }
  });
};
