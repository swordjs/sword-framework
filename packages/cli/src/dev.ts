import { renameSync } from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { resolve } from 'path';
import chokidar from 'chokidar';
import { debounce } from './util/index';
import { generateSchema } from './util/proto';
import { writeFileRecursive } from './util/file';
import { devUnicloudApp } from './platform/unicloud';
import log from './log';
import type { Argv } from 'mri';
import type { CommandConfig } from '../../../typings/config';

let indexcp: ChildProcess | null = null;

// 如果进程存在,则杀掉
const killProcess = (): void => {
  indexcp && indexcp.kill();
};

/**
 * @param {CommandConfigReturn} config
 */
const start = (args: Argv<CommandConfig>) => {
  killProcess();
  // 判断如果platform是server，则执行server端的dev
  // server端的dev指的就是node直接运行index.ts文件
  if (args.platform === 'server') {
    // 入口enrty ts 文件
    indexcp = spawn(`node`, ['-r', 'esbuild-register', './src/index.ts', '--platform=', args.platform], {
      stdio: 'inherit'
    });
    // 运行成功
    log.info(`启动入口文件: src/index.ts`);
  } else if (args.platform === 'unicloud') devUnicloudApp(args);
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
    `export interface ReqParams {

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
    `import { useApi } from '@sword-code-practice/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: async (ctx) => {
    return {
      message: 'hello'
    };
  }
});
`
  );
  // 修改API文件夹的名称，去掉前缀
  renameSync(resolve(cwd, sourceDir, 'api', ..._parentDir, dir), resolve(cwd, sourceDir, 'api', ..._parentDir, _dir));
  log.info(`${_dir} API创建成功，已自动生成index.ts,proto.ts`);
};

/**
 * 监听资源文件夹
 * @param {Config} config
 */
const listenApiSource = (args: Argv<CommandConfig>) => {
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
        start(args);
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
    log.err(error as Error);
  }
};

// 监听入口文件
const listenIndex = (args: Argv<CommandConfig>) => {
  const watcher = chokidar.watch(resolve('src', 'index.ts'), {
    ignoreInitial: true,
    atomic: 1000
  });
  watcher.on('all', async () => {
    start(args);
  });
};

export default async (args: Argv<CommandConfig>) => {
  start(args);
  listenIndex(args);
  // 监听资源文件夹下的api文件夹
  listenApiSource(args);
};
