import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { resolve } from 'path';

// 遍历packages以及example
const packages = readdirSync(resolve('packages'))
  .filter((p) => !['.DS_Store', 'README.md'].includes(p))
  .map((p) => {
    return {
      name: p,
      path: resolve('packages', p)
    };
  })
  .concat({
    name: 'example',
    path: resolve('examples')
  });

packages.forEach((pkg) => {
  spawn('pnpm', ['publish', '--no-git-checks'], {
    cwd: pkg.path,
    stdio: 'inherit'
  }).on('close', (code) => {
    if (code !== 0) {
      console.error(`${pkg.name} publish failed`);
    } else {
      console.log(`${pkg.name} publish success`);
    }
  });
});
