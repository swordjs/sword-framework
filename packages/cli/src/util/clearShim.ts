import { existsSync, lstatSync, readdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import log from '../core/log';
import type { Argv } from 'mri';
import type { CommandConfig } from '#types/config';

export default (args: Argv<CommandConfig>) => {
  // 如果当前存在shim文件夹, 就清空shim文件夹
  if (existsSync(resolve(process.cwd(), '.sword/shim'))) {
    const shimPath = resolve(process.cwd(), '.sword/shim');
    // 判断是否是文件夹
    if (lstatSync(shimPath).isDirectory()) {
      try {
        // 删除文件夹
        readdirSync(shimPath).forEach((file) => {
          const filePath = resolve(shimPath, file);
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        });
        log.success('shim folder is cleaned');
      } catch {
        log.err('delete shim folder failed');
      }
    } else {
      log.err('shim folder is not a directory');
    }
  }
};
