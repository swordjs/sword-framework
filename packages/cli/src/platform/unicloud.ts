import { resolve, join } from 'path';
import { symlink, existsSync, lstatSync, readFileSync, unlinkSync } from 'fs';
import log from '../core/log';
import { build } from '../build';
import { delDir, writeFileRecursive, copyDir } from '~util/file';
import { getPackageJson } from '~util/package';
import { configData } from '../core/config';
import { UnicloudEnv } from '~types/env';
import { t } from '../i18n/i18n-node';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

// Get cloud function target root directory
const getTargetPath = () => {
  // Determine whether the unicloud link is configured or not, if not, then an error is thrown
  if (!configData.value.unicloud?.link || configData.value.unicloud?.link === '') {
    log.err(`[unicloud]${t.Please_Config_Unicloud_Link()}`);
    log.err(`[unicloud]${t.About_Unicloud_Link_Config}: https://www.yuque.com/mlgrgm/lrf0ra/ngkk5m#wL5HU`);
    process.exit();
  }
  return `${configData.value.unicloud.link}/sword`;
};

// Add the specified code snippet to the source code
const addCode = async (args: Argv<CommandConfig>, sourcePath?: string) => {
  const _path = join('.sword', args._[0] as unknown as string, 'unicloud', 'src', 'index.js');
  const processShimData = readFileSync(resolve(process.cwd(), './.sword/shim/process.js')).toString();
  // Add the default exported code snippet to the source code
  await writeFileRecursive(
    resolve(process.cwd(), _path),
    `
    ${processShimData}
    ${sourcePath ? `process.env.${UnicloudEnv.symlinkSourcePath} = '${sourcePath}';` : ''}
    process.argv = ${JSON.stringify(process.argv)};
    ${readFileSync(resolve(process.cwd(), _path)).toString()}
  module.exports = async (e, c) => {
    let { event, context } = await import_sword_framework.useUnicloudApp(e, c);
    const validateResult = await import_sword_framework.useUnicloudValidateEvent(event, context);
    // 判断校验结果是否严格等于true
    if (validateResult !== true) {
      return validateResult;
    }
    const { apiMap } = await import_sword_framework.useGetApiMap({
      apiPath: event.route.split("?")[0]
    })
    return await import_sword_framework.useUnicloudTriggerApi(event, context, apiMap)
  }`
  );
};

/**
 *
 * unicloud环境下的启动服务器
 * @param {Argv<CommandConfig>} args
 */
export const devUnicloudApp = async (args: Argv<CommandConfig>) => {
  const sourcePath = resolve(process.cwd(), `./.sword/dev/unicloud`);
  await link(sourcePath);
  // 删除指定的文件夹
  delDir(resolve(process.cwd(), `.sword/dev/unicloud`));
  build(
    args,
    {
      success: async () => {
        await addCode(args, sourcePath);
        log.success(`[unicloud:dev]📦 ${t.Unicloud_Build_Success()}`);
      },
      error: () => log.err(`[unicloud:dev]📦 ${t.Unicloud_Build_Failed()}`)
    },
    {
      skipPackageJson: true,
      outPath: `./.sword/dev/unicloud`,
      minify: false
    }
  );
};

export const buildUnicloudApp = async (args: Argv<CommandConfig>) => {
  // 给云函数根目录的packagejson, 添加依赖
  const targetPath = getTargetPath();
  try {
    const packageData = getPackageJson(configData.value.unicloud.link);
    if (packageData) {
      const { package: packageJson, path: packageJsonPath } = packageData;
      const sourcePath = resolve(process.cwd(), `./.sword/build/unicloud`);
      // 判断json中的dependencies是否存在@swordjs/sword-framework
      if (!packageJson.dependencies!['@swordjs/sword-framework']) {
        packageJson.dependencies!['@swordjs/sword-framework'] = 'latest';
      }
      // 将packagejson写入
      await writeFileRecursive(packageJsonPath, JSON.stringify(packageJson, null, 4));
      try {
        // 判断unicloud产物是文件夹还是快捷方式, 如果是文件夹, 就递归删除, 如果是快捷方式, 则删除快捷方式
        if (lstatSync(targetPath).isDirectory()) {
          delDir(targetPath);
        }
        if (lstatSync(targetPath).isSymbolicLink()) {
          unlinkSync(targetPath);
        }
      } catch (error) {}
      // 在打包之前, 需要删除之前的产物
      delDir(sourcePath);
      // 打包unicloud app产物
      build(
        args,
        {
          success: async () => {
            await addCode(args);
            // 递归拷贝一个新的文件夹sword到unicloud目录
            copyDir(sourcePath, targetPath);
            log.success(`[unicloud]📦 ${t.Unicloud_Pack_Success()}}`);
          },
          error: (e) => {
            console.log(e);
            log.err(`[unicloud]📦 ${t.Unicloud_Pack_Failed()}`);
          }
        },
        {
          skipPackageJson: true,
          outPath: `./.sword/build/unicloud`,
          minify: true
        }
      );
    } else {
      // 不存在则报告错误
      log.err(`[unicloud:build] ${t.Unicloud_Target_Dir_Not_Exist()}`);
    }
  } catch (error) {
    log.err(error as Error);
  }
};

// 将文件夹软链接到目标文件夹
const link = async (sourcePath: string) => {
  const targetPath = getTargetPath();
  // 如果目标存在且目标是文件夹, 就删除
  try {
    if (lstatSync(targetPath).isDirectory()) {
      delDir(targetPath);
    }
  } catch (error) {}

  // 判断目标路径的sword是否存在，并且是否是替身，如果不存在/不是替身，就创建
  if (!existsSync(targetPath) || !lstatSync(targetPath).isSymbolicLink()) {
    symlink(sourcePath, targetPath, 'junction', (err) => {
      if (err) {
        log.err(`[unicloud:link]🔗${t.Unicloud_Link_Create_Failed()}`);
      } else {
        log.success(`[unicloud:link]🔗${t.Unicloud_Link_Create_Success}`);
        log.info(`[unicloud:link]${t.Unicloud_Link_Create_Failed_Hint()}}`);
      }
    });
  } else {
    log.info(`[unicloud:link] 🔗${t.Unicloud_Link_Skip_Create()}`);
  }
};
