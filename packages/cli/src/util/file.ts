import { resolve } from 'path';
import * as fs from 'fs';
import type { HttpInstructMethod } from './../../../../typings/index';

export type Map = {
  sourcePath: string;
  distPath: string;
  method: HttpInstructMethod[];
};

/**
 * 遍历资源目录，去获得无限级下的文件
 * @param {string} dir
 */
export const traverseSourceDir = (dir: string): string[][] => {
  // 资源文件夹路径
  const path = resolve(process.cwd(), dir);
  const result: string[][] = [];
  // 获取每个文件夹下的文件
  const getDirectoriesResult = (path: string) => {
    const list = getFilesByDirPath(path);
    list.map(async (d) => {
      // d可能为file/dir,所以这里进行判断
      if (fs.statSync(resolve(path, d)).isDirectory()) {
        // 文件夹，递归检索文件夹
        getDirectoriesResult(resolve(path, d));
      } else {
        result.push([path, d]);
      }
    });
  };
  getDirectoriesResult(path);
  return result;
};

// 获取指定path下所有的文件
const getFilesByDirPath = (path: string) => {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + '/' + file);
  });
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
