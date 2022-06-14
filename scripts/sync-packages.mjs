import { spawn } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

// 遍历packages
const packages = readdirSync(resolve('packages')).filter((p) => !['.DS_Store', 'README.md'].includes(p));

packages.forEach((pkg) => {
  // 读取packagejson里面的name
  const packageJson = JSON.parse(readFileSync(resolve('packages', pkg, 'package.json')).toString());
  const name = packageJson.name;
  // spawn open cnpm同步包
  spawn('open', [`https://npmmirror.com/sync/${name}`], {
    cwd: resolve('packages', pkg)
  }).on('close', (code) => {
    if (code !== 0) {
      console.error(`${pkg} sync failed`);
    } else {
      console.log(`${pkg} sync success`);
    }
  });
});
