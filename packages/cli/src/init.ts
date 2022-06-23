import { prompt } from 'enquirer';
import { $fetch } from 'ohmyfetch';
import mv from 'mv';
import download from 'download';
import { spawnSync } from 'child_process';
import consola from 'consola';
import { existsSync } from 'fs';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

export default async (args: Argv<CommandConfig>) => {
  const project = await prompt({
    type: 'input',
    name: 'value',
    message: '项目名称',
    validate: (value) => {
      return existsSync(value) ? '项目已存在' : true;
    }
  });
  const CNPM_PACKAGE_URL = 'https://registry.npmmirror.com/@swordjs/sword-framework-example';
  const packageInfo = await $fetch(CNPM_PACKAGE_URL);
  // 获取全部的版本(倒序)
  const versions = Object.keys(packageInfo.versions).reverse();
  const version = await prompt({
    type: 'select',
    choices: versions,
    name: 'value',
    message: '选择项目版本'
  });
  const now = String(new Date().getTime());
  // 下载项目
  await download(`${CNPM_PACKAGE_URL}/-/sword-framework-example-${(version as any)['value']}.tgz`, now, {
    extract: true
  });
  mv(`${now}/package`, (project as any)['value'], { mkdirp: true }, (err) => {
    if (err) {
      throw err;
    }
    // rm 删除原目录
    spawnSync('rm', ['-rf', now]);
    // 初始化项目成功
    consola.success(`初始化${(project as any)['value']}项目成功⚡️`);
    consola.info(`你完全可以使用pnpm,yarn,npm安装项目（我就不给你装了，我也不知道你喜欢什么❤️  ）`);
  });
};
