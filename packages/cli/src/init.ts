import { prompt } from 'enquirer';
import { $fetch } from 'ohmyfetch';
import mv from 'mv';
import download from 'download';
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import log from './core/log';
import { t } from './i18n/i18n-node';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

export default async (args: Argv<CommandConfig>) => {
  const project = await prompt({
    type: 'input',
    name: 'value',
    message: t.Project_Name(),
    validate: (value) => {
      return existsSync(value) ? t.Project_Exist() : true;
    }
  });
  const CNPM_PACKAGE_URL = 'https://registry.npmmirror.com/@swordjs/sword-framework-example';
  const packageInfo = await $fetch(CNPM_PACKAGE_URL);
  // Get all versions (in reverse order)
  const versions = Object.keys(packageInfo.versions).reverse();
  const version = await prompt({
    type: 'select',
    choices: versions,
    name: 'value',
    message: t.Select_Project_Version()
  });
  const now = String(new Date().getTime());
  // Download Project
  await download(`${CNPM_PACKAGE_URL}/-/sword-framework-example-${(version as any)['value']}.tgz`, now, {
    extract: true
  });
  mv(`${now}/package`, (project as any)['value'], { mkdirp: true }, (err) => {
    if (err) {
      throw err;
    }
    // Use del to delete in windows
    spawnSync(process.platform === 'win32' ? 'del' : 'rm', ['-rf', now]);
    // Initialize project successfully
    log.success(t.Init_Project_Success(project));
    log.info(t.Init_Project_Success_Hint());
  });
};
