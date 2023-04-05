import { writeFileRecursive } from '~util/file';
import { isDev } from '~util/env';
import log from './core/log';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { configData } from './core/config';
import { t } from './i18n/i18n-node';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';
import type { Result } from './core/api';

export default async (args: Argv<CommandConfig>) => {
  if (isDev()) {
    try {
      const { share } = configData.value;
      // 读取api.json内容
      const apiJson: Result = JSON.parse(readFileSync(resolve(process.cwd(), `./src/api.json`), 'utf-8'));
      for (const key in apiJson) {
        // 获取其中的protopath, 并且读取文件内容
        const protoPath = apiJson[key].protoPath;
        const protoContent = readFileSync(protoPath as string).toString();
        const currentKey = `${key.substring(1).split('/').join('_')}.d.ts`;
        writeFileRecursive(resolve(share?.path as string, share?.dirName as string, share?.type?.dirName as string, currentKey), protoContent);
      }
      // 塞入package.json
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
