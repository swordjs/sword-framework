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
      if (platformName === 'uniCloud-aliyun') {
        checkUnicloudPath('uniCloud-tencent');
      } else {
        // 如果腾讯云还报错
        log.err(t.Schema2Interface_Platform_Dir_Not_Found());
        // 请用户确认是否是unicloud项目
        log.err(t.Schema2Interface_Platform_Dir_Not_Found_Hint());
        return false;
      }
    }
    return platformName;
  };

  // 检查是否是unicloud项目
  const checkResult = checkUnicloudPath();
  // 查看检查结果是否全等于false
  if (checkResult === false) {
    return;
  } else {
    // 拿到有效的unicloud文件夹路径
    const unicloudPath = resolve(process.cwd(), checkResult);
    // 查看unicloudPath下有没有database文件夹
    const databasePath = unicloudPath + '/database';
    if (existsSync(databasePath) && lstatSync(databasePath).isDirectory()) {
      // 拿到database文件夹下的所有文件
      const files = readdirSync(databasePath).filter((f) => f.includes('schema.json'));
      files.map(async (f) => {
        const complieResult = complie(`${databasePath}/${f}`);
        const tsName = unicloudPath + `/typings/database/${f.replace('schema.json', '')}d.ts`;
        await writeFileRecursive(tsName, complieResult);
        // ts文件编译成功
        log.success(`${f} ${t.Schema2Interface_Compile_Success()} ${tsName}`);
      });
    } else {
      log.err(t.Schema2Interface_Database_Dir_Not_Found());
      return;
    }
  }
};
