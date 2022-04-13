import { spawn } from 'child_process';
import { readdirSync, readFile } from 'fs';
import { resolve } from 'path';

// 遍历packages
const packages = readdirSync(resolve(__dirname, '../packages'));

packages.forEach((pkg) => {
  if (['.DS_Store', 'README.md'].includes(pkg)) return;
  spawn('pnpm', ['publish', resolve(__dirname, '../packages', pkg), '--no-git-checks'], {}).on('close', (code) => {
    if (code !== 0) {
      console.error(`${pkg} publish failed`);
    } else {
      console.log(`${pkg} publish success`);
      // // 读取package下的package.json
      readFile(resolve(__dirname, '../packages', pkg, 'package.json'), 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        // 解析package.json
        const packageJson = JSON.parse(data);
        // 调用cnpm curl api 同步包版本
        spawn('open', [`https://npmmirror.com/sync/${packageJson.name}`], {}).on('close', (code) => {
          if (code !== 0) {
            console.error(`${pkg} sync failed`);
          } else {
            console.log(`${pkg} sync success`);
          }
        });
      });
    }
  });
});
