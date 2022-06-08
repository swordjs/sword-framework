export type CommandConfig = {
  platform: 'server' | 'unicloud';
  // cli提供了很多工具向用户暴露, 这个参数指定了工具函数名称, 用于cli调用
  'util-name': null | 'schema2interface';
};

export type CommandConfigReturn = Required<CommandConfig>;
