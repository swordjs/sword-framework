import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import esbuild from 'esbuild';
import glob from 'glob';
import { delDir } from '~util/file';
import log from './core/log';
import { buildUnicloudApp } from './platform/unicloud';
import { writeFileRecursive, copyDir } from '~util/file';
import { esbuildPluginConditionalCompiler, esbuildDefineConditionalCompiler } from './core/conditionalCompiler';
import { esbuildPluginAutoImport } from './core/autoImport';
import { env } from '~types/env';
import { t } from './i18n/i18n-node';
import { generateSchema } from './core/api';
import {
  APP_SRC_DIR,
  API_SUITE_JSON_FILE,
  PRIVATE_CACHE_DIR,
  PRIVATE_DEV_DIR,
  PRIVATE_SHIM_DIR,
  SERVER_DIR,
  PRIVATE_BUILD_DIR,
  PRIVATE_SHIM_SERVER_DIR,
  UNICLOUD_DIR
} from '~util/constants';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

type BuildOptions = {
  skipPackageJson?: boolean;
  outPath?: string;
  minify?: boolean;
};

// Default packing parameters
const defaultBuildOptions: Required<BuildOptions> = {
  skipPackageJson: false,
  // default output path is server
  outPath: join(PRIVATE_CACHE_DIR, PRIVATE_BUILD_DIR, SERVER_DIR),
  minify: true
};

const buildDefine = (args: Argv<CommandConfig>) => {
  return {
    ...esbuildDefineConditionalCompiler(args.platform),
    [`process.env.${env.swordCommand}`]: `'${args._[0]}'`
  };
};

/**
 *
 * Abstract build function
 * @description The main purpose of abstracting the build function is, not only to allow external introduction, but also to give external more control, so the main abstraction of the option
 * @param {Argv<CommandConfig>} args
 * @param {{
 *     success: () => void;
 *     error: (e) => void;
 *   }} cb
 * @param {BuildOptions} [buildOptions]
 */
export const build = async (
  args: Argv<CommandConfig>,
  cb: {
    success: () => void;
    error: (e: any) => void;
  },
  buildOptions?: BuildOptions
) => {
  buildOptions = {
    ...defaultBuildOptions,
    ...buildOptions
  };
  // Export packge.json to the .sword directory
  if (!buildOptions.skipPackageJson) {
    await writeFileRecursive(resolve(process.cwd(), buildOptions.outPath!, 'package.json'), readFileSync(resolve(process.cwd(), 'package.json')).toString());
  }
  // Compile the proto and export the json to the .sword directory
  try {
    await generateSchema(resolve(process.cwd(), buildOptions.outPath!, APP_SRC_DIR, API_SUITE_JSON_FILE));
    // glob blocks the d.ts file, but wraps all the ts and js files under src
    const entryPoints = glob.sync(`./${APP_SRC_DIR}/**/!(*.d).{ts,js}`);
    esbuild
      .build({
        // Use the global syntax to set entryPoints
        entryPoints,
        format: 'cjs',
        platform: 'node',
        outdir: join(buildOptions.outPath!, APP_SRC_DIR),
        mainFields: ['module', 'main'],
        minify: buildOptions.minify,
        plugins: [esbuildPluginAutoImport, esbuildPluginConditionalCompiler(args.platform)],
        define: buildDefine(args)
      })
      .then(() => {
        cb.success();
      })
      .catch((e) => {
        cb.error(e);
      });
  } catch (error) {}
};

export default async (args: Argv<CommandConfig>) => {
  try {
    // Empty the sword folder, you need to empty it according to platform conditions
    delDir(resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_DEV_DIR, args.platform));
    if (args.platform === SERVER_DIR) {
      // Copy the shim folder to the server
      copyDir(
        resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR),
        resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_BUILD_DIR, SERVER_DIR, PRIVATE_SHIM_SERVER_DIR)
      );
      build(args, {
        success: () => log.success(`[${SERVER_DIR}]📦 ${t.Server_Pack_Success()}`),
        error: () => log.err(`[${SERVER_DIR}]📦 ${t.Server_Pack_Failed()}`)
      });
    } else if (args.platform === UNICLOUD_DIR) await buildUnicloudApp(args);
  } catch (e) {
    throw log.err(e as Error);
  }
};
