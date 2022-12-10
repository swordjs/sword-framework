export interface Config {
  unicloud?: {
    link: string;
  };
  // 共享目录
  share?: {
    // share目录的名称
    dirName: string;
    // share目录的路径
    path?: string;
    type?: {
      dirName?: string;
      package?: {
        [key: string]: any
      }
    }
  }
}
