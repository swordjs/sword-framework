import { resolve } from 'path';
import { symlink, existsSync, lstatSync, readFileSync } from 'fs';
import log from '../log';
import { build } from '../build';
import { delDir, writeFileRecursive } from '../util/file';
import { configData } from '.././config';

import type { Argv } from 'mri';
import type { CommandConfig } from '../../../../typings/config';

/**
 *
 * unicloud环境下的启动服务器
 * @param {Argv<CommandConfig>} args
 */
export const dev = (args: Argv<CommandConfig>) => {
  link();
  // 删除指定的文件夹
  delDir(resolve(process.cwd(), `.sword/dev/unicloud`));
  build(
    args,
    {
      success: () => {
        const path = `.sword/dev/unicloud/src/index.js`;
        log.success(`[unicloud:dev]📦 编译成功`);
        // 在源代码中添加默认导出的代码片段
        writeFileRecursive(resolve(process.cwd(), path), `${readFileSync(resolve(process.cwd(), path)).toString()}module.exports = import_sword_framework`);
      },
      error: () => log.err(`[unicloud:dev]📦 编译出现未知问题`)
    },
    {
      skipPackageJson: true,
      outPath: `./.sword/dev/unicloud`,
      minify: false,
      inject: ['./.sword/shim/unicloud.js']
    }
  );
};

// 将文件夹软链接到目标文件夹
const link = () => {
  const targetPath = `${configData.unicloud.link}/sword`;
  // 判断目标路径的sword是否存在，并且是否是替身，如果不存在/不是替身，就创建
  if (!existsSync(targetPath) || !lstatSync(targetPath).isSymbolicLink()) {
    const sourcePath = resolve(process.cwd(), `./.sword/dev/unicloud`);
    symlink(sourcePath, targetPath, 'junction', (err) => {
      if (err) {
        log.err('[unicloud:link]🔗创建软链接失败');
      } else {
        // 初始化unicloud shim
        shim({
          sourcePath
        });
        log.success(`[unicloud:link]🔗软链接成功`);
        log.info(`[unicloud:link]在hbuilderx中，无法在项目管理中显示通过软链接创建的文件夹，你可以打开文件目录查看详情`);
      }
    });
  } else {
    log.info(`[unicloud:link] 🔗跳过创建软链接，因为目标目录已存在sword目录`);
  }
};

// 生成unicloud shim
export const shim = (params: { sourcePath: string }) => {
  const shimPath = resolve(process.cwd(), './.sword/shim/unicloud.js');
  const shim = `
  // unicloud shim
process.env._unicloud_shim_symlink_source_path = '${params.sourcePath}';
  `;
  writeFileRecursive(shimPath, shim);
  log.success(`[shim:unicloud]创建shim成功`);
};
