import { resolve } from 'path';
import log from './log';
import { writeFileRecursive } from './util/file';

// 生成process shim
export const processShim = () => {
  const shimPath = resolve(process.cwd(), './.sword/shim/process.js');
  const shim = `
  // unicloud shim
  process.argv = ${JSON.stringify(process.argv)}
  `;
  writeFileRecursive(shimPath, shim);
  log.success(`[shim:process]创建shim成功`);
};
