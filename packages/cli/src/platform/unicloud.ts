import { resolve, join } from 'path';
import { symlink, existsSync, lstatSync, readFileSync, unlinkSync } from 'fs';
import log from '../core/log';
import { build } from '../build';
import { delDir, writeFileRecursive, copyDir } from '~util/file';
import { getPackageJson } from '~util/package';
import { configData } from '../core/config';
import { UnicloudEnv } from '~types/env';
import { t } from '../i18n/i18n-node';
import {
  PRIVATE_CACHE_DIR,
  PRIVATE_DEV_DIR,
  PRIVATE_BUILD_DIR,
  UNICLOUD_CACHE_DIR,
  UNICLOUD_DIR,
  UNICLOUD_SRC_DIR,
  UNICLOUD_INDEX_FILE
} from '~util/constants';
import { renderUnicloudIndexCode } from '../code/unicloud';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

/**
 *
 * Get cloud function target root directory
 * @return {*}
 */
const getTargetPath = () => {
  // Determine whether the unicloud link is configured or not, if not, then an error is thrown
  if (!configData.value.unicloud?.link || configData.value.unicloud?.link === '') {
    log.err(`[unicloud]${t.Please_Config_Unicloud_Link()}`);
    log.err(`[unicloud]${t.About_Unicloud_Link_Config}: https://www.yuque.com/mlgrgm/lrf0ra/ngkk5m#wL5HU`);
    process.exit();
  }
  return join(configData.value.unicloud.link, `/${UNICLOUD_CACHE_DIR}`);
};

/**
 *
 * Add the specified code snippet to the source code
 * @param {Argv<CommandConfig>} args
 * @param {string} [sourcePath]
 */
const addCode = async (args: Argv<CommandConfig>, sourcePath?: string) => {
  const _path = join(PRIVATE_CACHE_DIR, args._[0] as unknown as string, UNICLOUD_DIR, UNICLOUD_SRC_DIR, UNICLOUD_INDEX_FILE);
  const processShimData = readFileSync(resolve(process.cwd(), './.sword/shim/process.js')).toString();
  // Add the default exported code snippet to the source code
  await writeFileRecursive(
    resolve(process.cwd(), _path),
    `
    ${processShimData}
    ${sourcePath ? `process.env.${UnicloudEnv.symlinkSourcePath} = '${sourcePath}';` : ''}
    process.argv = ${JSON.stringify(process.argv)};
    ${readFileSync(resolve(process.cwd(), _path)).toString()}
    ${renderUnicloudIndexCode()}
    `
  );
};

/**
 *
 * Start server in unicloud environment
 * @param {Argv<CommandConfig>} args
 */
export const devUnicloudApp = async (args: Argv<CommandConfig>) => {
  const sourcePath = resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_DEV_DIR, UNICLOUD_DIR);
  await link(sourcePath);
  // Delete the specified folder
  delDir(sourcePath);
  build(
    args,
    {
      success: async () => {
        await addCode(args, sourcePath);
        log.success(`[unicloud:dev]📦 ${t.Unicloud_Build_Success()}`);
      },
      error: () => log.err(`[unicloud:dev]📦 ${t.Unicloud_Build_Failed()}`)
    },
    {
      skipPackageJson: true,
      outPath: sourcePath,
      minify: false
    }
  );
};

/**
 * buildUnicloudApp
 * @param {Argv<CommandConfig>} args
 */
export const buildUnicloudApp = async (args: Argv<CommandConfig>) => {
  // Add a dependency to the packagejson, in the root of the cloud function
  const targetPath = getTargetPath();
  try {
    const packageData = getPackageJson(configData.value.unicloud.link);
    if (packageData) {
      const { package: packageJson, path: packageJsonPath } = packageData;
      const sourcePath = resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_BUILD_DIR, UNICLOUD_DIR);
      // Determine if @swordjs/sword-framework exists for dependencies in json
      if (!packageJson.dependencies?.['@swordjs/sword-framework']) {
        packageJson.dependencies = {
          ...packageJson.dependencies,
          '@swordjs/sword-framework': 'latest'
        };
      }
      await writeFileRecursive(packageJsonPath, JSON.stringify(packageJson, null, 4));
      try {
        // Determine whether the unicloud product is a folder or a shortcut, if it is a folder, delete it recursively, if it is a shortcut, then delete the shortcut
        if (lstatSync(targetPath).isDirectory()) {
          delDir(targetPath);
        }
        if (lstatSync(targetPath).isSymbolicLink()) {
          unlinkSync(targetPath);
        }
      } catch (error) {}
      // Before packing, need to delete the previous product
      delDir(sourcePath);
      build(
        args,
        {
          success: async () => {
            await addCode(args);
            // Recursively copy a new folder sword to the unicloud directory
            copyDir(sourcePath, targetPath);
            log.success(`[unicloud]📦 ${t.Unicloud_Pack_Success()}}`);
          },
          error: (e) => {
            console.log(e);
            log.err(`[unicloud]📦 ${t.Unicloud_Pack_Failed()}`);
          }
        },
        {
          skipPackageJson: true,
          outPath: sourcePath,
          minify: true
        }
      );
    } else {
      // Report error if not present
      log.err(`[unicloud:build] ${t.Unicloud_Target_Dir_Not_Exist()}`);
    }
  } catch (error) {
    log.err(error as Error);
  }
};

/**
 *
 * Softlinking a folder to a target folder
 * @param {string} sourcePath
 */
const link = async (sourcePath: string) => {
  const targetPath = getTargetPath();
  // If the target exists and the target is a folder, delete
  try {
    if (lstatSync(targetPath).isDirectory()) {
      delDir(targetPath);
    }
  } catch (error) {}

  // Determine if the sword of the target path exists and is a stand-in, and if not/not a stand-in, create
  if (!existsSync(targetPath) || !lstatSync(targetPath).isSymbolicLink()) {
    symlink(sourcePath, targetPath, 'junction', (err) => {
      if (err) {
        log.err(`[unicloud:link]🔗${t.Unicloud_Link_Create_Failed()}`);
      } else {
        log.success(`[unicloud:link]🔗${t.Unicloud_Link_Create_Success}`);
        log.info(`[unicloud:link]${t.Unicloud_Link_Create_Success_Hint()}}`);
      }
    });
  } else {
    log.info(`[unicloud:link] 🔗${t.Unicloud_Link_Skip_Create()}`);
  }
};
