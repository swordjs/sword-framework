import { renameSync } from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { resolve } from 'path';
import chokidar from 'chokidar';
import { debounce } from './util';
import { generateSchema } from './util/proto';
import { writeFileRecursive } from './util/file';
import log from './log';
import type { Argv } from 'mri';
import type { Config } from '../typings/config';

let indexcp: ChildProcess | null = null;

/**
 * 使用@swc-node/register执行index.ts
 * @param {ConfigReturn} config
 */
const start = () => {
  // 入口enrty ts 文件
  indexcp = spawn(`node`, ['-r', '@swc-node/register', 'src/index.ts'], {
    stdio: 'inherit'
  });
  indexcp.on('exit', (code) => {
    if (code) {
      // 错误
      log.err(`执行入口文件错误`);
    }
  });
  // 运行成功
  log.info(`启动入口文件: src/index.ts`);
};

// 重启服务器
const restart = () => {
  // 重启服务器
  log.info('重启服务器...');
  // 杀掉现在的进程
  indexcp && indexcp.kill();
  setTimeout(() => {
    start();
  }, 300);
};

/**
 * 生成预先设置的API结构
 * @param {string} sourceDir
 * @param {string} dir
 */
const generatePreset = (sourceDir: string, parentDir: string, dir: string) => {
  // 删除前缀后的root根节点路由
  const _dir = dir.slice(1);
  // 处理parnetDir的路径，使之能够通过/进行分割成多个文件夹，比如/level1/level2 会被分割成['level1', 'level2']，这会让resolve更好工作
  const _parentDir = parentDir.split('/');
  const cwd = process.cwd();
  // 生成proto
  writeFileRecursive(
    `${resolve(cwd, sourceDir, 'api', ..._parentDir, dir, 'proto.ts')}`,
    `
export interface ReqParams {

}
export interface ReqQuery {

}
export interface Res {
  message: string;
}`
  );
  // 生成API
  writeFileRecursive(
    `${resolve(cwd, sourceDir, 'api', ..._parentDir, dir, 'index.ts')}`,
    `
import { useApi } from "@sword-code-practice/sword-framework";
import { ReqQuery, ReqParams, Res } from "./proto";

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: (ctx) => {
    return {
      message: "hello",
    };
  },
});`
  );
  // 修改API文件夹的名称，去掉前缀
  renameSync(resolve(cwd, sourceDir, 'api', ..._parentDir, dir), resolve(cwd, sourceDir, 'api', ..._parentDir, _dir));
  log.info(`${_dir} API创建成功，已自动生成index.ts,proto.ts`);
};

/**
 * 监听资源文件夹
 * @param {Config} config
 */
const listenApiSource = () => {
  try {
    log.info(`正在监听工程中的src/api文件夹...`);
    const watcher = chokidar.watch(resolve('src', 'api'), {
      ignoreInitial: true,
      atomic: 1000
    });
    watcher.on(
      'all',
      debounce(async (event: any, path: string) => {
        // 重新编译proto.json
        await generateSchema(resolve(process.cwd(), `./src/proto.json`));
        restart();
        switch (event) {
          case 'addDir':
            // 当文件夹约定一个规则，比如下划线开头，那么将会自动生成proto.ts 以及初始化的hook函数
            const prefix = '_';
            // 新增文件夹名称
            const dir = path.substring(path.lastIndexOf('/') + 1);
            // 父级目录，比如当前创建的文件夹有父级别，那么就是字符串api之后且dir之间的路径，我们需要把资源产出到正确的目录中
            const parentDir = path.substring(path.lastIndexOf('api') + 3, path.lastIndexOf(dir));
            // 判断当前新建的文件夹是否有前缀
            if (prefix === dir[0]) {
              // 自动生成预设置
              generatePreset('src', parentDir, dir);
            }
            break;
          case 'change':
            log.info(`[重新编译]触发文件:${path}`);
        }
      }, 500)
    );
  } catch (error) {
    throw new Error(error);
  }
};

// 监听入口文件
const listenIndex = () => {
  const watcher = chokidar.watch(resolve('src', 'index.ts'), {
    ignoreInitial: true,
    atomic: 1000
  });
  watcher.on('all', async () => {
    restart();
  });
};

export default async (args: Argv<Config>) => {
  try {
    // 生成protoschema到指定目录, proto schema为sword runtime提供验证服务
    await generateSchema(resolve(process.cwd(), `./src/proto.json`));
    // 判断platform
    switch (args.platform) {
      case 'server':
        start();
        break;
      case 'unicloud':
        break;
      default:
        break;
    }
    listenIndex();
    // 监听资源文件夹下的api文件夹
    listenApiSource();
  } catch (e) {
    log.err(e);
    indexcp && indexcp.kill();
  }
};
