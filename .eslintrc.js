module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    // 支持ts-ignore
    '@typescript-eslint/ban-ts-ignore': 'off'
  }
};
