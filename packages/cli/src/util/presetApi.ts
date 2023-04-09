import { resolve } from 'path';
import { writeFileRecursive } from '~util/file';
import log from '../core/log';
import { t } from '../i18n/i18n-node';
import { renderProtoCode, renderApiCode } from '../code/api';
import { API_SUITE_PROTO_FILE, API_SUITE_INDEX_FILE, APP_SRC_DIR } from '~util/constants';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

/**
 * Generate pre-set API structures
 * @param {string} sourceDir
 * @param {string} dir
 */
export default (args: Argv<CommandConfig>) => {
  if (!args['presetApi-name']) {
    log.err(t.PresetApi_Name_Is_Required());
  } else {
    presetApi(APP_SRC_DIR, '/', args['presetApi-name']);
  }
};

export const presetApi = async (sourceDir: string, parentDir: string, dir: string): Promise<[string, string[]]> => {
  // Remove the root root route after the prefix
  // Process the path of parnetDir so that it can be split into multiple folders by /, e.g. /level1/level2 will be split into ['level1', 'level2'], which will make resolve work better
  const _parentDir = parentDir.split('/');
  const cwd = process.cwd();
  const prefixPath = [cwd, sourceDir, ..._parentDir, dir];
  // Generate proto
  await writeFileRecursive(`${resolve(...prefixPath, API_SUITE_PROTO_FILE)}`, renderProtoCode());
  // Generate API
  await writeFileRecursive(`${resolve(...prefixPath, API_SUITE_INDEX_FILE)}`, renderApiCode());
  return [cwd, _parentDir];
};
