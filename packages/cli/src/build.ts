import { resolve } from 'path';
import { readFileSync } from 'fs';
import esbuild from 'esbuild';
import { delDir } from './util/file';
import log from './log';
import { writeFileRecursive } from './util/file';
import { generateSchema } from './util/proto';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

// build shim

const build = async (args: Argv<CommandConfig>) => {
  const buildRootPath = `./.sword/build/${args.platform}`;
  // 将packge.json输出到.sword目录中
  writeFileRecursive(resolve(process.cwd(), `${buildRootPath}/package.json`), readFileSync(resolve(process.cwd(), 'package.json')).toString());
  // 编译proto，并且把json输出到.sword目录中
  // apiPaths是代表了有效api的index.ts路径，我们只需要把路径传递给esbuild即可
  const { apiPaths } = await generateSchema(resolve(process.cwd(), `${buildRootPath}/src/proto.json`));
  // 使用esbuild构建
  esbuild
    .build({
      entryPoints: ['./src/index.ts', ...apiPaths.map((a) => `./src/api${a}/index.ts`)],
      format: 'cjs',
      platform: 'node',
      outdir: `${buildRootPath}/src`,
      mainFields: ['module', 'main'],
      minify: true
    })
    .then(() => {
      log.success(`[${args.platform}]📦 打包成功`);
    })
    .catch(() => {
      log.err(`[${args.platform}]📦 打包出现未知问题`);
    })
    .finally(() => {
      process.exit();
    });
};

export default async (args: Argv<CommandConfig>) => {
  try {
    // 清空sword文件夹
    delDir(resolve(process.cwd(), '.sword'));
    build(args);
  } catch (e) {
    throw log.err(new Error(e as any));
  }
};
