import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';
import type { PackageJson } from '#types/package';

// 获取运行框架的项目的package.json信息
export const getPackageJson = (path: string = cwd()): { package: PackageJson; path: string } | null => {
  const packageJsonPath = resolve(path, 'package.json');
  // 判断package.json是否存在
  if (existsSync(packageJsonPath)) {
    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    return {
      package: packageJson,
      path: packageJsonPath
    };
  } else {
    return null;
  }
};
