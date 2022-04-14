#! /usr/bin/env node

import { register } from '@swc-node/register/register';
import dev from './dev';
import build from './build';
import init from './init';
import doc from './doc';
import mri from 'mri';
import type { Config } from '../typings/config';

type commands = 'dev' | 'build' | 'init' | 'doc';

register({});

async function main() {
  const args = mri<Config>(process.argv.splice(2), {
    default: {
      platform: 'server'
    }
  });
  const cliHandler = {
    dev,
    build,
    init,
    doc
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
