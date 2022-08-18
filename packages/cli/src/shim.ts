import { resolve } from 'path';
import log from './log';
import { writeFileRecursive } from '~util/file';

// 生成process shim
export const processShim = async (command: 'dev' | 'build') => {
  const shimPath = resolve(process.cwd(), './.sword/shim/process.js');
  const shim = `
  // process shim
  process.argv = ${JSON.stringify(process.argv)}
  process.env._sword_command = '${command}'
  `;
  await writeFileRecursive(shimPath, shim);
  log.success(`[shim:process]创建shim成功`);
};
