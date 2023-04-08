import { renameSync } from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { join, resolve } from 'path';
import chokidar from 'chokidar';
import { debounce } from '~util/index';
import { generateSchema } from './core/api';
import { devUnicloudApp } from './platform/unicloud';
import { presetApi } from './util/presetApi';
import log from './core/log';
import { getImportCode, generateTypeDeclarationsFile } from './core/autoImport';
import { t } from './i18n/i18n-node';
import { APP_SRC_DIR, API_SUITE_JSON_FILE, API_SUITE_INDEX_FILE, SERVER_DIR, UNICLOUD_DIR, APP_API_DIR } from '~util/constants';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

let indexcp: ChildProcess | null = null;

// If the process exists, kill it
const killProcess = (): void => {
  indexcp && indexcp.kill();
};

const generate = async () => {
  await generateSchema(resolve(process.cwd(), APP_SRC_DIR, API_SUITE_JSON_FILE), {
    dev: true,
    format: true
  });
};

/**
 * @param {CommandConfigReturn} config
 */
const start = async (args: Argv<CommandConfig>) => {
  killProcess();
  // Determine if the platform is server, then execute the server side dev
  // The server-side dev means that the node runs the index.ts file directly
  if (args.platform === SERVER_DIR) {
    // Entry enrty ts file
    indexcp = spawn(
      `node`,
      [
        '--loader',
        '@swordjs/esbuild-register/loader',
        '-r',
        '@swordjs/esbuild-register',
        `${resolve(process.cwd(), APP_SRC_DIR, API_SUITE_INDEX_FILE)}`,
        // auto import code by esbuild banner options
        `--esbuild-config=${JSON.stringify({
          banner: await getImportCode()
        })}`
      ],
      {
        stdio: 'inherit'
      }
    );
    generateTypeDeclarationsFile();
    // success
    log.info(`${t.Launch_Entry_File()}: ${APP_SRC_DIR}/${API_SUITE_INDEX_FILE}`);
  } else if (args.platform === UNICLOUD_DIR) devUnicloudApp(args);
};

/**
 * Generate pre-set API structures
 * @param {string} sourceDir
 * @param {string} dir
 */
const generatePreset = async (sourceDir: string, parentDir: string, dir: string) => {
  // Remove the root root route after the prefix
  const _dir = dir.slice(1);
  try {
    const [cwd, _parentDir] = await presetApi(sourceDir, parentDir, dir);
    renameSync(resolve(cwd, sourceDir, ..._parentDir, dir), resolve(cwd, sourceDir, ..._parentDir, _dir));
  } catch (error) {
    return log.err(`${t.API_Create_Failed()}, ${error as Error}`);
  }
  return log.info(`${_dir} ${t.API_Create_Success()}`);
};

/**
 * Listening to the resource folder
 * @param {Config} config
 */
const listenApiSource = (args: Argv<CommandConfig>) => {
  try {
    log.info(t.Watching_Src_Api_Folder());
    const watcher = chokidar.watch(resolve(APP_SRC_DIR, APP_API_DIR), {
      ignoreInitial: true,
      atomic: 1000
    });
    watcher.on(
      'all',
      debounce(async (event: any, path: string) => {
        start(args);
        switch (event) {
          case 'addDir':
            // When a folder agrees on a rule, such as starting with an underscore, then proto.ts and the initialized hook function will be generated automatically
            const prefix = '_';
            // New folder name
            const dir = path.substring(path.lastIndexOf('/') + 1);
            // Parent directory, such as the currently created folder has a parent level, then it is the path between the string api after and dir, we need to output the resources to the correct directory
            const parentDir = path.substring(path.lastIndexOf(APP_API_DIR) + APP_API_DIR.length, path.lastIndexOf(dir));
            // Determine if the current new folder has a prefix
            if (prefix === dir[0]) {
              // Automatic generation of pre-settings
              await generatePreset(join(APP_SRC_DIR, APP_API_DIR), parentDir, dir);
            }
            break;
          case 'change':
            log.info(t.Rebuild_Trigger_File(path));
        }
        await generate();
      }, 500)
    );
  } catch (error) {
    log.err(error as Error);
  }
};

/**
 * Listening portal file
 *
 * @param {Argv<CommandConfig>} args
 */
const listenIndex = (args: Argv<CommandConfig>) => {
  const watcher = chokidar.watch(resolve(APP_SRC_DIR, API_SUITE_INDEX_FILE), {
    ignoreInitial: true,
    atomic: 1000
  });
  watcher.on('all', async () => {
    start(args);
  });
};

export default async (args: Argv<CommandConfig>) => {
  await generate();
  start(args);
  listenIndex(args);
  listenApiSource(args);
};
