import { resolve } from 'path';
import * as fs from 'fs';
import type { HttpInstructMethod } from './../../../../typings/index';

export type Map = {
  sourcePath: string;
  distPath: string;
  method: HttpInstructMethod[];
};

/**
 * 递归写入文件内容
 * @param {string} path
 * @param {string} buffer
 * @param {((p: any) => void | null)} callback
 */
export const writeFileRecursive = (path: string, buffer: string) => {
  return new Promise((resolve, reject) => {
    const lastPath = path.substring(0, path.lastIndexOf('/'));
    try {
      fs.mkdirSync(lastPath, { recursive: true });
      fs.writeFileSync(path, buffer);
    } catch (error) {
      reject(error);
    }
    resolve(null);
  });
};

/**
 * 递归清空文件夹内容
 * @param {string} path
 */
export const delDir = (path: string) => {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(path);
  }
};

/**
 *
 * 递归拷贝文件夹
 * @param {string} source
 * @param {string} target
 */
export const copyDir = (source: string, target: string) => {
  const files = fs.readdirSync(source);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }
  files.forEach((file) => {
    const currentSource = source + '/' + file;
    const currentTarget = target + '/' + file;
    if (fs.statSync(currentSource).isDirectory()) {
      fs.mkdirSync(currentTarget);
      copyDir(currentSource, currentTarget);
    } else {
      fs.copyFileSync(currentSource, currentTarget);
    }
  });
};
