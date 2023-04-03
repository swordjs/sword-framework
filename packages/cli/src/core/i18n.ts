import { use } from 'i18next';
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import { resolve } from 'path';

export const init = (lng?: string) => {
  return use(FsBackend).init<FsBackendOptions>({
    debug: false,
    lng: lng || 'en',
    ns: 'cli',
    initImmediate: true,
    preload: ['en', 'cn'],
    backend: {
      loadPath: resolve(__dirname, `../locales/{{lng}}/{{ns}}.json`)
    }
  });
};
