#! /usr/bin/env node

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as esbuildRegister from 'esbuild-register/dist/node';
import dev from './dev';
import build from './build';
import init from './init';
import doc from './doc';
import util from './util';
import { processShim } from './shim';
import { initConfig } from './config';
import { commandArgs as args } from '../../../util/config';

esbuildRegister.register();

type commands = 'dev' | 'build' | 'init' | 'doc' | 'util';

async function main() {
  // 解析config参数
  await initConfig();
  if (['dev', 'build'].includes(args._[0])) {
    // 加载shim
    processShim();
  }
  // 解析命令行参数
  const cliHandler = {
    dev,
    build,
    init,
    doc,
    util
  };
  if (args._[0]) {
    cliHandler[args._[0] as commands](args);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export * from './config';
