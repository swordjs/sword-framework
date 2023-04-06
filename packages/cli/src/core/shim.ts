import { resolve } from 'path';
import log from './log';
import { writeFileRecursive } from '~util/file';
import { env } from '~types/env';
import { PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR, SHIM_PROCESS_FILE } from '~util/constants';
import { t } from '../i18n/i18n-node';
import type { Config } from '../../typings/config';
import type { CommandConfig } from '~types/config';

/**
 *
 * // Generate process shim
 * @param {('dev' | 'build')} command
 * @param {CommandConfig['platform']} platform
 * @param {Config} config
 */
export const processShim = async (command: 'dev' | 'build', platform: CommandConfig['platform'], config: Config) => {
  const shimPath = resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR, SHIM_PROCESS_FILE);
  const shim = `
  // process shim
  process.env.${env['swordCommand']} = '${command}'
  process.env.${env['swordPlatform']} = '${platform}'
  process.env.${env['swordConfig']} = '${JSON.stringify(config)}'
  `;
  await writeFileRecursive(shimPath, shim);
  log.success(`[shim:process]${t.Create_Shim_Successfully()}`);
};
