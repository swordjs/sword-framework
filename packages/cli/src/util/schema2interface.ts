import { readdirSync, readFileSync, existsSync, lstatSync } from 'fs';
import { resolve } from 'path';
import { camelCase } from '~util/index';
import { writeFileRecursive } from '~util/file';
import log from '../core/log';
import { t } from '../i18n/i18n-node';
import { UNICLOUD_ALIYUN_DIR, UNICLOUD_TENCENT_DIR } from '~util/constants';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

/**
 * @name The compiler file returns the contents of the processed type declaration
 * @param {*} filePath
 */
const complie = (filePath: string) => {
  const { properties } = JSON.parse(readFileSync(filePath).toString());
  let _value = ``;
  for (const key in properties) {
    // Determine if the key has . If it exists. means it is defining a foreign key (unicloud)
    if (key.includes('.')) {
      continue;
    }
    // Deconstruction type and introduction
    const { bsonType = 'string', description = '' } = properties[key];
    // Define some types, expressions in ts will default to string
    const defaultKeys = ['timestamp', 'string'];
    const objectKeys = ['object'];
    const numberKeys = ['number', 'int', 'double'];
    const booleanKeys = ['bool'];
    _value += `/* ${description} */
  ${key}: ${
      defaultKeys.includes(bsonType)
        ? 'string'
        : objectKeys.includes(bsonType)
        ? 'Record<string, unknown>'
        : numberKeys.includes(bsonType)
        ? 'number'
        : booleanKeys.includes(bsonType)
        ? 'boolean'
        : 'unknown'
    }${bsonType === 'array' ? '[]' : ''};
    `;
  }
  // Get file name
  const lastIndex = filePath.lastIndexOf('/') + 1;
  // Remove prefixes such as sword, .schema.json and format the strings
  const fileName = camelCase(filePath.substring(lastIndex).replace(/sword-|.schema.json/g, ''));
  return `/* tslint:disable */
export interface ${fileName[0].toUpperCase() + fileName.substring(1)} {
${_value}
}
  `;
};

export default (args: Argv<CommandConfig>) => {
  // Prompt the user for documentation on this tool
  log.info(`${t.Schema2Interface_Documentation()}: https://www.yuque.com/mlgrgm/lrf0ra/lywbzt#nwG2Q`);
  // Judging the current environment
  if (args.platform !== 'unicloud') {
    log.err(t.Schema2Interface_Only_Support_Unicloud_Platform());
    log.info(t.Schema2Interface_Current_Platform_Is(args.platform));
    return;
  }
  // Check if the folder meets the requirements
  const checkUnicloudPath = (platformName = 'uniCloud-aliyun') => {
    try {
      readdirSync(resolve(process.cwd(), platformName));
    } catch (error) {
      // If the current check is aliyun, then retry checking tencent
      if (platformName === UNICLOUD_ALIYUN_DIR) {
        checkUnicloudPath(UNICLOUD_TENCENT_DIR);
      } else {
        // If Tencent Cloud still reports errors
        log.err(t.Schema2Interface_Platform_Dir_Not_Found());
        // Ask the user to confirm if it is a unicloud project
        log.err(t.Schema2Interface_Platform_Dir_Not_Found_Hint());
        return false;
      }
    }
    return platformName;
  };

  // Check if it is a unicloud project
  const checkResult = checkUnicloudPath();
  // Check if the check result is all equal to false
  if (checkResult === false) {
    return;
  } else {
    // Get the path to the valid unicloud folder
    const unicloudPath = resolve(process.cwd(), checkResult);
    // Check if there is a database folder under unicloudPath
    const databasePath = unicloudPath + '/database';
    if (existsSync(databasePath) && lstatSync(databasePath).isDirectory()) {
      // Get all the files in the database folder
      const files = readdirSync(databasePath).filter((f) => f.includes('schema.json'));
      files.map(async (f) => {
        const complieResult = complie(`${databasePath}/${f}`);
        const tsName = unicloudPath + `/typings/database/${f.replace('schema.json', '')}d.ts`;
        await writeFileRecursive(tsName, complieResult);
        log.success(`${f} ${t.Schema2Interface_Compile_Success()} ${tsName}`);
      });
    } else {
      log.err(t.Schema2Interface_Database_Dir_Not_Found());
      return;
    }
  }
};
