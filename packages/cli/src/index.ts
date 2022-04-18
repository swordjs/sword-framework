#! /usr/bin/env node

import { register } from '@swc-node/register/register';
import dev from './dev';
import build from './build';
import init from './init';
import doc from './doc';
import { parseCommandArgs } from '../../../src/core/config';

type commands = 'dev' | 'build' | 'init' | 'doc';

register({});

async function main() {
  const args = parseCommandArgs();
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
