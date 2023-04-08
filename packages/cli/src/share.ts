import { writeFileRecursive } from '~util/file';
import { isDev } from '~util/env';
import log from './core/log';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { configData } from './core/config';
import { t } from './i18n/i18n-node';
import { APP_SRC_DIR, API_SUITE_JSON_FILE } from '~util/constants';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';
import type { Result } from './core/api';

export default async (args: Argv<CommandConfig>) => {
  if (isDev()) {
    try {
      const { share } = configData.value;
      // Read the api.json content
      const apiJson: Result = JSON.parse(readFileSync(resolve(process.cwd(), APP_SRC_DIR, API_SUITE_JSON_FILE), 'utf-8'));
      for (const key in apiJson) {
        // Get the protopath, and read the contents of the file
        const protoPath = apiJson[key].protoPath;
        const protoContent = readFileSync(protoPath as string).toString();
        const currentKey = `${key.substring(1).split('/').join('_')}.d.ts`;
        writeFileRecursive(resolve(share?.path as string, share?.dirName as string, share?.type?.dirName as string, currentKey), protoContent);
      }
      // Stuff package.json
      writeFileRecursive(
        resolve(share?.path as string, share?.dirName as string, share?.type?.dirName as string, `package.json`),
        JSON.stringify(share?.type?.package, null, 4)
      );
      log.success(`${t.Share_Success()}: ${share?.path}/${share?.dirName}/${share?.type?.dirName}`);
      log.success(t.Share_Success_Hint());
    } catch (error) {
      log.err(t.Share_Failed());
    }
  } else {
    log.err(t.Share_Failed_Hint());
  }
};
