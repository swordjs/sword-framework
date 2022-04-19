import { resolve } from 'path';
import { readFileSync } from 'fs';
import esbuild from 'esbuild';
import { delDir } from './util/file';
import log from './log';
import { writeFileRecursive } from './util/file';
import { generateSchema } from './util/proto';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

type BuildOptions = {
  skipPackageJson?: boolean;
  outPath?: string;
  minify?: boolean;
};

// 默认的打包参数
const defaultBuildOptions: BuildOptions = {
  skipPackageJson: false,
  outPath: `./.sword/build/server`,
  minify: true
};

/**
 *
 * 抽象build函数
 * @description 抽象build函数的目的主要是，不仅让外部可以引入，还可以让外部有更多的控制权，所以主要抽象了option
 * @param {Argv<CommandConfig>} args
 * @param {{
 *     success: () => void;
 *     error: () => void;
 *   }} cb
 * @param {BuildOptions} [buildOptions]
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const build = async (
  args: Argv<CommandConfig>,
  cb: {
    success: () => void;
    error: () => void;
  },
  buildOptions?: BuildOptions
) => {
  buildOptions = {
    ...defaultBuildOptions,
    ...buildOptions
  };
  // 将packge.json输出到.sword目录中
  if (!buildOptions.skipPackageJson) {
    writeFileRecursive(resolve(process.cwd(), `${buildOptions.outPath}/package.json`), readFileSync(resolve(process.cwd(), 'package.json')).toString());
  }
  // 编译proto，并且把json输出到.sword目录中
  // apiPaths是代表了有效api的index.ts路径，我们只需要把路径传递给esbuild即可
  const { apiPaths } = await generateSchema(resolve(process.cwd(), `${buildOptions.outPath}/src/proto.json`));
  // 使用esbuild构建
  esbuild
    .build({
      entryPoints: ['./src/index.ts', ...apiPaths.map((a) => `./src/api${a}/index.ts`)],
      format: 'cjs',
      platform: 'node',
      outdir: `${buildOptions.outPath}/src`,
      mainFields: ['module', 'main'],
      minify: buildOptions.minify
    })
    .then(() => {
      cb.success();
    })
    .catch(() => {
      cb.error();
    });
};

export default async (args: Argv<CommandConfig>) => {
  try {
    // 清空sword文件夹,需要根据platform条件进行清空
    delDir(resolve(process.cwd(), `.sword/dev/${args.platform}`));
    build(args, {
      success: () => log.success(`[${args.platform}]📦 打包成功`),
      error: () => log.err(`[${args.platform}]📦 打包出现未知问题`)
    });
  } catch (e) {
    throw log.err(new Error(e as any));
  }
};
