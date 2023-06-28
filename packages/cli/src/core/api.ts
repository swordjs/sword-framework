import { resolve } from 'path';
import { createRequire } from 'module';
import { TSBufferProtoGenerator } from 'tsbuffer-proto-generator';
import { traverseSourceDir, writeFileRecursive } from '~util/file';
import { getKey } from '~util/map';
import log from './log';
import { existsSync } from 'fs';
import { t } from './../i18n/i18n-node';
import type { HttpApiReturn, HttpApiInstructType } from '~types/index';
import { API_SUITE_METHOD_FILE, API_SUITE_INDEX, APP_SRC_DIR, APP_API_DIR, API_SUITE_FILES, API_SUITE_INDEX_FILE, API_SUITE_PROTO_FILE } from '~util/constants';

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

type ParseRouteReturn = { methods: string[]; params: { key: string; spread: boolean }[] };

/**
 *
 * abstract parse route slot
 * @param {string} fileName
 * @param {ParseRouteReturn['params']} params
 * @param {number} slotStart
 * @param {number} slotEnd
 * @return {*}  {(void | null)}
 */
const parseRouteSlot = (fileName: string, params: ParseRouteReturn['params'], slotStart: number, slotEnd: number): void | null => {
  // validate file name
  if (slotStart !== -1 && slotEnd !== -1) {
    // computed slotStart and slotEnd count, if count > 1, return null
    const slotStartCount = fileName.split('[').length - 1;
    const slotEndCount = fileName.split(']').length - 1;
    if (slotStartCount > 1 || slotEndCount > 1) {
      return null;
    }
    // [ and ] can only appear once, and ] must come after [, and [ must be at the beginning.
    if (slotStart !== 0 || slotEnd < slotStart) {
      return null;
    }
    const slot = fileName.substring(1, slotEnd);
    // slot must be not empty
    if (!slot) {
      return null;
    }
    const isSpread = slot.startsWith('...');
    params.push({ key: isSpread ? slot.substring(3) : slot, spread: isSpread });
  }
};

const parseRouteMethod = (fileName: string, methods: string[], slot: { slotStart: number; slotEnd: number; slotExists: boolean }): void | null => {
  // if slot end exists, method must be after slot
  const { slotExists, slotStart, slotEnd } = slot;
  if (slotExists) {
    // After checking if there are any methods after the slot end
    const methodsExists = fileName.substring(slotEnd + 1);
    if (methodsExists) {
      // TODO: validate methods
    }
  } else {
    // TODO: validate first methods
  }
};

/**
 * @description The function of parsing routes, extracting routing information from the specified file environment,
 * returning methods, allowing only one routing parameter slot to be passed in, if there is more than one you need to
 * use the *spread (...)* syntax 
 * @version 2.0.0
 * @example
    get.ts // { methods: ['get'], params: [] }
    post.ts // { methods: ['post'], params: [] }
    get|post.ts // { methods: ['get', 'post'], params: [] }
    [name].ts // { methods: [], params: [{key: 'name', spread: false}] }
    [...params].ts // { methods: [], params: [{key: 'params', spread: true}] }
    [...params].get.ts // { methods: ['get'], params: [{key: 'params', spread: true}] }
 * @param {string} fileName
 */
export const parseRoute = (path: string, fileName: string): ParseRouteReturn | null => {
  if (fileName === API_SUITE_INDEX) {
    // TODO: parse index.ts
  } else {
    const methods: string[] = [];
    const params: ParseRouteReturn['params'] = [];
    const slotStart = fileName.indexOf('[');
    const slotEnd = fileName.indexOf(']');
    // parse route slot
    const slotResult = parseRouteSlot(fileName, params, slotStart, slotEnd);
    if (slotResult === null) {
      log.err(t.Parse_Route_Validate_Error_Hint());
      return null;
    }
    // parse route method
    const methodResult = parseRouteMethod(fileName, methods, { slotStart, slotEnd, slotExists: params.length !== 0 });
    if (methodResult === null) {
      log.err(t.Parse_Route_Validate_Error_Hint());
      return null;
    }
  }
  return null;
};

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
  const appPath = resolve(APP_SRC_DIR, APP_API_DIR);
  const files = traverseSourceDir(appPath);
  for (const key in files) {
    const [path, d] = files[key];
    const modulePath = resolve(path, d);
    delete require.cache[modulePath];
    parseRoute(path, d.substring(0, d.lastIndexOf('.')));
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
