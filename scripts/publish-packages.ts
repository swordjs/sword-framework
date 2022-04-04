/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const { readdirSync } = require('fs');
const { resolve } = require('path');

// 遍历packages
const packages = readdirSync(resolve(__dirname, '../packages'));

packages.forEach((package) => {
  if (['.DS_Store', 'README.md'].includes(package)) return;
  spawn('npm', ['publish', resolve(__dirname, '../packages', package)], {}).on('close', (code) => {
    if (code !== 0) {
      console.error(`${package} publish failed`);
    } else {
      console.log(`${package} publish success`);
    }
  });
});
