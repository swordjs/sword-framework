import { PackageJson } from '~types/package';
import type { TransProtoReturn } from '../src/commands/doc';
import type { Map } from '@runtime/core/map';
import type { Import, Preset } from 'unimport';
import type { Locales } from '../src/i18n/i18n-types';

export interface Config {
  language?: Locales;
  server?: {
    // Server port
    port?: number;
  };
  unicloud?: {
    link: string;
  };
  // Shared directory
  share?: {
    // Name of the shared directory
    dirName?: string;
    // Path of the shared directory
    path?: string;
    type?: {
      dirName?: string;
      package?: PackageJson;
    };
  };
  // Configuration for compiling documents
  doc?: {
    // Doc server
    server?: boolean;
    markdown?: {
      // The compilation function will be called once for each API. The input parameter is the API information, and the output is the existing markdown document.
      compile: (result: TransProtoReturn, markdown: string, options: { apiMap: Record<string, Map> }) => string;
      output: (markdownMap: Record<string, string>) => void;
    };
  };
  // AutoImport
  autoImport?: {
    imports?: Import[];
    presets?: Preset[];
  };
}
