#! /usr/bin/env node

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { register } from '@swc-node/register/register';
import dev from './dev';
import build from './build';
import mri from 'mri';

type commands = 'dev' | 'build';

register({});

async function main() {
  const args = mri(process.argv.splice(2));
  const cliHandler = {
    dev,
    build
  };
  if (args._[0]) {
    cliHandler[args._[0] as commands]();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export * from './config';
