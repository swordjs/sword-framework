import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { resolve } from 'path';

// 遍历packages
const packages = readdirSync(resolve('packages')).filter((p) => !['.DS_Store', 'README.md'].includes(p));

packages.forEach((pkg) => {
  // 运行build命令
  // cd 子目录, 并且执行npm build
  spawn('pnpm', ['build'], {
    cwd: resolve('packages', pkg)
  }).on('close', (code) => {
    if (code !== 0) {
      console.error(`${pkg} build failed`);
    } else {
      console.log(`${pkg} build success`);
    }
  });
});
