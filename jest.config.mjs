// 导出一个配置对象
export default {
  rootDir: 'tests',
  preset: 'ts-jest/presets/default-esm',
  transform: {},
  verbose: true,
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  extensionsToTreatAsEsm: ['.ts']
};
