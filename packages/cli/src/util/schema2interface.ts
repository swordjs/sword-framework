import { readdirSync, readFileSync, existsSync, lstatSync } from 'fs';
import { resolve } from 'path';
import { camelCase } from '~util/index';
import { writeFileRecursive } from '~util/file';
import log from '../core/log';
import type { Argv } from 'mri';
import type { CommandConfig } from '#types/config';

/**
 * @name 编译文件返回处理后的类型声明内容
 * @param {*} filePath
 */
const complie = (filePath: string) => {
  // 读取文件
  const { properties } = JSON.parse(readFileSync(filePath).toString());
  let _value = ``;
  for (const key in properties) {
    // 判断key是否有.，如果存在.说明是在定义外键（unicloud）
    if (key.includes('.')) {
      continue;
    }
    // 解构类型和介绍
    const { bsonType = 'string', description = '' } = properties[key];
    // 定义一些类型，在ts中表达会默认为string
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
  // 获取文件名
  const lastIndex = filePath.lastIndexOf('/') + 1;
  // 去掉sword，.schema.json等前缀并且对字符串进行格式化
  const fileName = camelCase(filePath.substring(lastIndex).replace(/sword-|.schema.json/g, ''));
  return `/* tslint:disable */
export interface ${fileName[0].toUpperCase() + fileName.substring(1)} {
${_value}
}
  `;
};

export default (args: Argv<CommandConfig>) => {
  // 提示用户此工具的文档
  log.info(`schema2interface documentation: https://www.yuque.com/mlgrgm/lrf0ra/lywbzt#nwG2Q`);
  // 判断当前的环境
  if (args.platform !== 'unicloud') {
    log.err('schema2interface only support unicloud platform');
    log.info(`current platform is ${args.platform}`);
    return;
  }
  // 查看文件夹是否符合要求
  const checkUnicloudPath = (platformName = 'uniCloud-aliyun') => {
    try {
      readdirSync(resolve(process.cwd(), platformName));
    } catch (error) {
      // 如果当前检查的是aliyun, 则重试检查tencent
      if (platformName === 'uniCloud-aliyun') {
        checkUnicloudPath('uniCloud-tencent');
      } else {
        // 如果腾讯云还报错
        log.err(`uniCloud-aliyun/uniCloud-tencent dir not found`);
        // 请用户确认是否是unicloud项目
        log.err(`please confirm you are using unicloud project`);
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
        log.success(`${f} complie success -> ${tsName}`);
      });
    } else {
      log.err(`database dir not found`);
      return;
    }
  }
};
