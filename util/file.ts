import * as fs from 'fs';
import { resolve } from 'path';

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
export const getFilesByDirPath = (path: string) => {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + '/' + file);
  });
};

// 判断是否是软链接
export const isSymlink = (path: string) => {
  try {
    return require.resolve(path);
  } catch (e) {
    return false;
  }
};
