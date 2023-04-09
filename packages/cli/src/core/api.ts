import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { traverseSourceDir, writeFileRecursive } from '~util/file';
import { getKey } from '~util/map';
import log from './log';
import { existsSync } from 'fs';
import { t } from './../i18n/i18n-node';
import type { HttpApiReturn, HttpApiInstructType } from '~types/index';
import { APP_SRC_DIR, APP_API_DIR, API_SUITE_FILES, API_SUITE_INDEX_FILE, API_SUITE_PROTO_FILE } from '~util/constants';

export type Result = Record<
  string,
  {
    path?: string;
    method?: string[];
    protoPath?: string;
    proto: Record<string, unknown>;
  }
>;

type Options = {
  dev?: boolean;
  format?: boolean;
  keepComment?: boolean;
};

type Map = Record<string, { path: string; method: string[]; protoPath?: string; type: HttpApiInstructType }>;

/**
 * Generate apimap
 * @return {*}  {Promise<{
 *   apiMap: Map;
 * }>}
 */
export const getApiMap = async (): Promise<{
  apiMap: Map;
}> => {
  const require = createRequire(import.meta.url);
  const apiMap: Map = {};
  const files = traverseSourceDir(resolve(APP_SRC_DIR, APP_API_DIR));
  for (const key in files) {
    const [path, d] = files[key];
    const modulePath = resolve(path, d);
    delete require.cache[modulePath];
    if (API_SUITE_FILES.includes(d)) {
      // apiPath such as hello/detail and so on
      // If it is under windows, the \ in the path is escaped as \\, so it needs to be escaped
      const apiPath = path.substring(path.lastIndexOf(APP_API_DIR)).substring(APP_API_DIR.length).replace(/\\/g, '/');
      // Execute the function and get the instruct indicator
      if (d === API_SUITE_INDEX_FILE) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(modulePath) as any;
        const { instruct }: HttpApiReturn<any> = module.default ?? module.main;
        // Parse instruct, is a map
        instruct.forEach((value, key) => {
          let _key = getKey(`/${APP_API_DIR}`, apiPath, key);
          // In windows environment, / is escaped to \\, so it needs to be escaped to /
          _key = _key.replace(/\\/g, '/');
          apiMap[_key] = {
            path: modulePath,
            type: value.type,
            method: [...value.methods]
          };
          // If the proto.ts file exists in the current directory, record
          if (existsSync(resolve(path, API_SUITE_PROTO_FILE))) {
            apiMap[_key] = { ...apiMap[_key], protoPath: resolve(path, 'proto.ts') };
          }
        });
      }
    }
  }
  return {
    apiMap
  };
};

/**
 *
 * Retrieve resource directory to generate api path array & protoMap & proto ast tree
 * @param {(string | null)} outPath
 * @param {Options} [options={
 *     // Whether it is a dev environment or not, if it is a dev environment, no other content other than proto is generated
 *     dev: false,
 *     format: false,
 *     keepComment: false
 *   }]
 * @return {*}  {Promise<{
 *   apiResult: Result;
 * }>}
 */
export const generateSchema = async (
  outPath: string | null,
  options: Options = {
    // Whether it is a dev environment or not, if it is a dev environment, no other content other than proto is generated
    dev: false,
    format: false,
    keepComment: false
  }
): Promise<{
  apiResult: Result;
}> => {
  const { apiMap } = await getApiMap();
  const result: Result = {};
  try {
    for (const key in apiMap) {
      const generator = new TSBufferProtoGenerator({
        keepComment: options.keepComment
      });
      // If it is a dev environment, only the proto is generated
      if (apiMap[key].protoPath) {
        result[key] = {
          proto: await generator.generate(apiMap[key].protoPath as any),
          ...(options.dev
            ? {
                path: apiMap[key].path,
                method: apiMap[key].method,
                protoPath: apiMap[key].protoPath,
                type: apiMap[key].type
              }
            : {})
        };
      }
    }
    // Determine if outPath exists, and if so, output api.json to the specified directory
    if (outPath) {
      // Generate API JSON file to specified directory
      await writeFileRecursive(outPath, JSON.stringify(result, null, options.dev ? 2 : 0));
      log.success(t.Schema_Loaded_Successfully());
    }
  } catch (error) {
    log.err(t.Schema_Loaded_Failed(error));
  }
  return { apiResult: result };
};
