import { resolve } from 'path';
import { readFileSync } from 'fs';
import esbuild from 'esbuild';
import glob from 'glob';
import { delDir } from '~util/file';
import log from './core/log';
import { buildUnicloudApp } from './platform/unicloud';
import { writeFileRecursive, copyDir } from '~util/file';
import { esbuildPluginConditionalCompiler, esbuildDefineConditionalCompiler } from './core/conditionalCompiler';
import { esbuildPluginAutoImport } from './core/autoImport';
import { env } from '~types/env';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';
import { generateSchema } from './core/api';

type BuildOptions = {
  skipPackageJson?: boolean;
  outPath?: string;
  minify?: boolean;
};

// 默认的打包参数
const defaultBuildOptions: Required<BuildOptions> = {
  skipPackageJson: false,
  outPath: `./.sword/build/server`,
  minify: true
};

const buildDefine = (args: Argv<CommandConfig>) => {
  return {
    ...esbuildDefineConditionalCompiler(args.platform),
    [`process.env.${env.swordCommand}`]: `'${args._[0]}'`
  };
};

/**
 *
 * 抽象build函数
 * @description 抽象build函数的目的主要是，不仅让外部可以引入，还可以让外部有更多的控制权，所以主要抽象了option
 * @param {Argv<CommandConfig>} args
 * @param {{
 *     success: () => void;
 *     error: (e) => void;
 *   }} cb
 * @param {BuildOptions} [buildOptions]
 */
export const build = async (
  args: Argv<CommandConfig>,
  cb: {
    success: () => void;
    error: (e: any) => void;
  },
  buildOptions?: BuildOptions
) => {
  buildOptions = {
    ...defaultBuildOptions,
    ...buildOptions
  };
  // 将packge.json输出到.sword目录中
  if (!buildOptions.skipPackageJson) {
    await writeFileRecursive(resolve(process.cwd(), `${buildOptions.outPath}/package.json`), readFileSync(resolve(process.cwd(), 'package.json')).toString());
  }
  // 编译proto，并且把json输出到.sword目录中
  try {
    await generateSchema(resolve(process.cwd(), `${buildOptions.outPath}/src/api.json`));
    // glob屏蔽d.ts文件, 但是包裹src下所有的ts和js文件
    const entryPoints = glob.sync('./src/**/!(*.d).{ts,js}');
    esbuild
      .build({
        // 使用global语法来设置entryPoints
        entryPoints,
        format: 'cjs',
        platform: 'node',
        outdir: `${buildOptions.outPath}/src`,
        mainFields: ['module', 'main'],
        minify: buildOptions.minify,
        plugins: [esbuildPluginAutoImport, esbuildPluginConditionalCompiler(args.platform)],
        define: buildDefine(args)
      })
      .then(() => {
        cb.success();
      })
      .catch((e) => {
        cb.error(e);
      });
  } catch (error) {}
};

export default async (args: Argv<CommandConfig>) => {
  try {
    // 清空sword文件夹,需要根据platform条件进行清空
    delDir(resolve(process.cwd(), `.sword/dev/${args.platform}`));
    if (args.platform === 'server') {
      // 拷贝shim文件夹到server中
      copyDir(resolve(process.cwd(), `.sword/shim`), resolve(process.cwd(), `.sword/build/server/.shim`));
      build(args, {
        success: () => log.success(`[server]📦 打包成功`),
        error: () => log.err(`[server]📦 打包出现未知问题`)
      });
    } else if (args.platform === 'unicloud') await buildUnicloudApp(args);
  } catch (e) {
    throw log.err(e as Error);
  }
};
