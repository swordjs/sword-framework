import { resolve } from 'path';
import { readFileSync } from 'fs';
import esbuild from 'esbuild';
import { getConfig } from './config';
import { delDir } from './util/file';
import log from './log';
import { writeFileRecursive } from './util/file';
import { generateProtoSchema } from './util/proto';
import type { ConfigReturn } from '../typings/config';

// build shim

const build = async (config: ConfigReturn) => {
  // 将packge.json输出到.sword目录中
  writeFileRecursive(resolve(process.cwd(), './.sword/package.json'), readFileSync(resolve(process.cwd(), 'package.json')).toString());
  // 编译proto，并且把json输出到.sword目录中
  // apiPaths是代表了有效api的index.ts路径，我们只需要把路径传递给esbuild即可
  const apiPaths = await generateProtoSchema(resolve(process.cwd(), `./.sword/src/proto.json`));
  // 使用esbuild构建
  esbuild
    .build({
      entryPoints: ['./src/index.ts', ...apiPaths.map((a) => `./src/api${a}/index.ts`)],
      format: 'cjs',
      platform: 'node',
      outdir: '.sword/src',
      mainFields: ['module', 'main'],
      minify: true
    })
    .then(() => {
      log.success('📦 打包成功');
    })
    .catch(() => {
      log.err(`📦 打包出现未知问题`);
    })
    .finally(() => {
      process.exit(1);
    });
};

export default async () => {
  try {
    const config = await getConfig();
    // 清空sword文件夹
    delDir(resolve(process.cwd(), '.sword'));
    build(config);
  } catch (e) {
    throw log.err(new Error(e as any));
  }
};
