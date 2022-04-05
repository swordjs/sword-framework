/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const { readdirSync, readFile } = require('fs');
const { resolve } = require('path');

// 遍历packages
const packages = readdirSync(resolve(__dirname, '../packages'));

packages.forEach((package) => {
  if (['.DS_Store', 'README.md'].includes(package)) return;
  spawn('pnpm', ['publish', resolve(__dirname, '../packages', package), '--no-git-checks'], {}).on('close', (code) => {
    if (code !== 0) {
      console.error(`${package} publish failed`);
    } else {
      console.log(`${package} publish success`);
      // // 读取package下的package.json
      readFile(resolve(__dirname, '../packages', package, 'package.json'), 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        // 解析package.json
        const packageJson = JSON.parse(data);
        // 调用cnpm curl api 同步包版本
        spawn('open', [`https://npmmirror.com/sync/${packageJson.name}`], {}).on('close', (code) => {
          if (code !== 0) {
            console.error(`${package} sync failed`);
          } else {
            console.log(`${package} sync success`);
          }
        });
      });
    }
  });
});
