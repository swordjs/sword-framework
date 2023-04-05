import { resolve } from 'path';
import { createUnimport, TypeDeclarationOptions } from 'unimport';
import Unimport from 'unimport/unplugin';
import { APP_SRC_DIR, AUTO_IMPORT_TYPE_DECLARATION_FILE } from '~util/constants';
import { writeFileRecursive } from '~util/file';
import { configData } from '../core/config';
import type { Preset } from 'unimport';
import type { EsbuildPlugin } from 'unplugin';

const autoImportsPresets: Preset[] = [
  {
    from: '@swordjs/sword-framework',
    imports: ['useApi', 'useApp', 'usePipeline', 'usePlugin', 'useGetApiMap', 'usePlatform', 'usePlatformHook', 'useIsDev', 'useIsProd']
  }
];

let importCode: string;
let toExports: (filepath?: string | undefined) => Promise<string>;
let generateTypeDeclarations: (options?: TypeDeclarationOptions | undefined) => Promise<string>;
let esbuildPluginAutoImport: EsbuildPlugin;

const getImportCode = async () => {
  if (importCode) return importCode;
  const code = await toExports();
  // code is the automatically imported code
  // export { *** } from "***"
  // Use regular to change export to import and convert to the commonjs specification, e.g. const { *** } = require('***')
  importCode = code.replace(/export\s+\{(.+?)\}\s+from\s+['"](.+?)['"]/g, 'const {$1} = require("$2")');
  return importCode;
};

const generateTypeDeclarationsFile = async () => {
  const typeDeclarationsCode = await generateTypeDeclarations();
  // typeDeclarationsCode is the automatically imported type declarations
  writeFileRecursive(resolve(process.cwd(), APP_SRC_DIR, AUTO_IMPORT_TYPE_DECLARATION_FILE), typeDeclarationsCode);
};

export default () => {
  const options = {
    presets: autoImportsPresets.concat(configData.value.autoImport?.presets || []),
    imports: configData.value.autoImport?.imports || []
  };
  const unimport = createUnimport(options);
  toExports = unimport.toExports;
  generateTypeDeclarations = unimport.generateTypeDeclarations;
  esbuildPluginAutoImport = Unimport.esbuild(options);
};

export { getImportCode, generateTypeDeclarationsFile, esbuildPluginAutoImport };
