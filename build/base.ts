import { defineBuildConfig } from 'unbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const paths = JSON.parse(readFileSync(resolve('../../tsconfig.json')).toString()).compilerOptions.paths;
const alias: any = {};

for (const key in paths) {
  // 为package目录中的子包提供服务, 在子包运行命令时, 需要跳出2个文件夹找到根目录的tsconfig, 而不是子包的tsconfig
  alias[key.replace('/*', '')] = resolve('../../', paths[key][0].replace('/*', ''));
}

export default defineBuildConfig({
  entries: ['./src/index'],
  outDir: 'lib',
  declaration: true,
  rollup: {
    emitCJS: true,
    // 从tsconfig.json读取paths
    alias: {
      entries: alias
    },
    cjsBridge: true,
    esbuild: {
      target: 'node12'
    }
  }
});
