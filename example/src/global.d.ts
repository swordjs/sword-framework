export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      _SWORD_COMMAND: 'dev' | 'build' | 'init' | 'doc' | 'share' | 'util';
      _SWORD_PLATFORM: 'server' | 'unicloud';
    }
  }
}
