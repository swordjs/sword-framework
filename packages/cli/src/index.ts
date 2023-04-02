#! /usr/bin/env node

import * as esbuildRegister from 'esbuild-register/dist/node';
import dev from './dev';
import build from './build';
import init from './init';
import doc from './doc';
import util from './util';
import share from './share';
import packageJSON from './../package.json';
import { processShim } from './core/shim';
import { initConfig } from './core/config';
import { commandArgs as args } from '~util/config';
import { resolve } from 'path';
esbuildRegister.register();

type commands = 'dev' | 'build' | 'init' | 'doc' | 'share' | 'util';

async function main() {
  if (args['v']) {
    console.log(`cli version: ${packageJSON.version}`);
    return;
  }
  // 解析config参数
  const config = await initConfig();
  if (['dev', 'build'].includes(args._[0])) {
    // 创建shim
    processShim(args._[0] as 'dev' | 'build', args.platform, config);
  }
  // 加载可能已经预定义的shim
  try {
    await import(resolve(process.cwd(), './.sword/shim/process.js'));
  } catch (error) {}
  // 解析命令行参数
  const cliHandler = {
    dev,
    build,
    init,
    doc,
    share,
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

export * from './core/config';
