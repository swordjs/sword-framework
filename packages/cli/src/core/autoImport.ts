import { createUnimport } from 'unimport';
import Unimport from 'unimport/unplugin';

const autoImportsPresets = [
  {
    from: '@swordjs/sword-framework',
    imports: ['useApi', 'useApp', 'usePipeline', 'usePlugin', 'useGetApiMap', 'usePlatform', 'usePlatformHook', 'useIsDev', 'useIsProd']
  }
];

const { toExports } = createUnimport({
  presets: autoImportsPresets
});

const esbuildPluginAutoImport = Unimport.esbuild({ presets: autoImportsPresets });

let importCode: string;

const getImportCode = async () => {
  if (importCode) return importCode;
  const code = await toExports();
  // code is the automatically imported code
  // export { *** } from "***"
  // Use regular to change export to import and convert to the commonjs specification, e.g. const { *** } = require('***')
  importCode = code.replace(/export\s+\{(.+?)\}\s+from\s+['"](.+?)['"]/g, 'const {$1} = require("$2")');
  return importCode;
};

export { getImportCode, esbuildPluginAutoImport };
