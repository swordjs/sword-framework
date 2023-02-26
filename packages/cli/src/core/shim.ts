import { resolve } from 'path';
import log from './log';
import { writeFileRecursive } from '~util/file';
import { env } from '#types/env';
import type { Config } from '../../typings/config';
import type { CommandConfig } from '#types/config';

// 生成process shim
export const processShim = async (command: 'dev' | 'build', platform: CommandConfig['platform'], config: Config) => {
  const shimPath = resolve(process.cwd(), './.sword/shim/process.js');
  const shim = `
  // process shim
  process.env.${env['swordCommand']} = '${command}'
  process.env.${env['swordPlatform']} = '${platform}'
  process.env.${env['swordConfig']} = '${JSON.stringify(config)}'
  `;
  await writeFileRecursive(shimPath, shim);
  log.success(`[shim:process]创建shim成功`);
};
