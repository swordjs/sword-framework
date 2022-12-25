import { PackageJson } from '#types/package';
import type { TransProtoReturn } from "../src/doc"
import type { Map } from '@runtime/core/map';

export interface Config {
  unicloud?: {
    link: string;
  };
  // 共享目录
  share?: {
    // share目录的名称
    dirName?: string;
    // share目录的路径
    path?: string;
    type?: {
      dirName?: string;
      package?: PackageJson
    }
  },
  // 编译文档的配置
  doc?: {
    markdown?: {
      // 每一个api都会被调用一次编译函数, 传入的参数是api的信息, 返回的则是现有的markdown文档
      compile: (result: TransProtoReturn, markdown: string, options: { apiMap: Record<string, Map> }) => string,
      output: (markdownMap: Record<string, string>) => void
    },
    openapi?: {

    }
  }
  language?: "CN" | "EN";
}
