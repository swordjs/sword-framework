import { createUnimport } from 'unimport';
import Unimport from 'unimport/unplugin';

const autoImportsPresets = [
  {
    from: '@swordjs/sword-framework',
    imports: ['useApi', 'useApp', 'usePipeline', 'usePlugin', 'useGetApiMap', 'usePlatform', 'usePlatformHook', 'useIsDev', 'useIsProd']
  }
];

const { injectImports } = createUnimport({
  presets: autoImportsPresets
});

const esbuildPluginAutoImport = Unimport.esbuild({ presets: autoImportsPresets });

export { injectImports, esbuildPluginAutoImport };
