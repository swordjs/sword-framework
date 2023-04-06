import { existsSync, lstatSync, readdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import log from '../core/log';
import { t } from '../i18n/i18n-node';
import { PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR } from '~util/constants';

export default () => {
  const shimPath = resolve(process.cwd(), PRIVATE_CACHE_DIR, PRIVATE_SHIM_DIR);
  // If the shim folder currently exists, empty the shim folder
  if (existsSync(shimPath)) {
    // Determine if it is a folder
    if (lstatSync(shimPath).isDirectory()) {
      try {
        // Delete Folder
        readdirSync(shimPath).forEach((file) => {
          const filePath = resolve(shimPath, file);
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        });
        log.success(t.Shim_Folder_Is_Cleaned());
      } catch {
        log.err(t.Delete_Shim_Folder_Failed());
      }
    } else {
      log.err(t.Shim_Folder_Is_Not_A_Directory());
    }
  }
};
