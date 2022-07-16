import { defineBuildConfig } from 'unbuild';
import alias from '../util/alias';

export default defineBuildConfig({
  entries: ['./src/index'],
  outDir: 'lib',
  declaration: true,
  rollup: {
    emitCJS: true,
    // 从tsconfig.json读取paths
    alias: {
      entries: alias()
    },
    cjsBridge: true,
    esbuild: {
      target: 'node12'
    }
  }
});
