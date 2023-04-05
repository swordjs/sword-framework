#! /usr/bin/env node

import { register } from '@swordjs/esbuild-register/dist/node';
import dev from './dev';
import build from './build';
import init from './init';
import doc from './doc';
import util from './util';
import share from './share';
import packageJSON from './../package.json';
import { getImportCode } from './core/autoImport';
import { processShim } from './core/shim';
import { initConfig, configData } from './core/config';
import { commandArgs as args } from '~util/config';
import { resolve } from 'path';
import { PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR, SHIM_PROCESS_FILE } from '~util/constants';
import { t } from './i18n/i18n-node';

type commands = 'dev' | 'build' | 'init' | 'doc' | 'share' | 'util';

const main = async () => {
  // parse config params
  await initConfig();
  // The cli compiler may execute some ts files at runtime,
  // especially the program runtime logic in the dev environment
  await registerTsRuntimeByEsbuild();
  // check version
  if (args['v']) {
    console.log(`${t.CLI_Version()}: ${packageJSON.version}`);
    return;
  }
  if (['dev', 'build'].includes(args._[0])) {
    // create shim when dev or build
    processShim(args._[0] as 'dev' | 'build', args.platform, configData.value);
  }
  // Load the shim that may have been predefined
  try {
    await import(resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR, SHIM_PROCESS_FILE));
  } catch (error) {}
  // Parsing command line parameters
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
};

/**
 *
 * @description When using cli to compile api to api.json, the dev environment needs to run the ts file directly to get the information of each api
 */
const registerTsRuntimeByEsbuild = async () => {
  // get auto import code
  const code = await getImportCode();
  register({
    banner: code
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export * from './core/config';
