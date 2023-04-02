import { resolve, join } from 'path';
import { symlink, existsSync, lstatSync, readFileSync, unlinkSync } from 'fs';
import log from '../core/log';
import { build } from '../build';
import { delDir, writeFileRecursive, copyDir } from '~util/file';
import { getPackageJson } from '~util/package';
import { configData } from '../core/config';
import { UnicloudEnv } from '~types/env';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

// 获取云函数目标根目录
const getTargetPath = () => {
  // 判断unicloud的link是否配置, 如果没有配置, 则就抛出错误
  if (!configData.unicloud?.link || configData.unicloud?.link === '') {
    log.err('[unicloud]请配置unicloud.link (未配置或者为空)');
    log.err('[unicloud]关于unicloud.link的配置参考: https://www.yuque.com/mlgrgm/lrf0ra/ngkk5m#wL5HU');
    process.exit();
  }
  return `${configData.unicloud.link}/sword`;
};

// 在源代码中添加指定的代码片段
const addCode = async (args: Argv<CommandConfig>, sourcePath?: string) => {
  const _path = join('.sword', args._[0] as unknown as string, 'unicloud', 'src', 'index.js');
  const processShimData = readFileSync(resolve(process.cwd(), './.sword/shim/process.js')).toString();
  // 在源代码中添加默认导出的代码片段
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
        log.success(`[unicloud:dev]📦 编译成功`);
      },
      error: () => log.err(`[unicloud:dev]📦 编译出现未知问题`)
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
    const packageData = getPackageJson(configData.unicloud.link);
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
            log.success(`[unicloud]📦 打包成功, 请移动到hbuilderx中执行上传云函数命令`);
          },
          error: (e) => {
            console.log(e);
            log.err(`[unicloud]📦 打包出现未知问题`);
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
      log.err(`[unicloud:build] 目标目录不存在package.json`);
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
        console.log(err);
        log.err('[unicloud:link]🔗创建软链接失败');
      } else {
        log.success(`[unicloud:link]🔗软链接成功`);
        log.info(`[unicloud:link]在hbuilderx中，无法在项目管理中显示通过软链接创建的文件夹，你可以打开文件目录查看详情`);
      }
    });
  } else {
    log.info(`[unicloud:link] 🔗跳过创建软链接，因为目标目录已存在sword目录`);
  }
};
