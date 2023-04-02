import { renameSync } from 'fs';
import { ChildProcess, spawn } from 'child_process';
import { resolve } from 'path';
import chokidar from 'chokidar';
import { debounce } from '~util/index';
import { generateSchema } from './core/api';
import { devUnicloudApp } from './platform/unicloud';
import { presetApi } from './util/presetApi';
import log from './core/log';
import { getImportCode, generateTypeDeclarationsFile } from './core/autoImport';

import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

let indexcp: ChildProcess | null = null;

// 如果进程存在,则杀掉
const killProcess = (): void => {
  indexcp && indexcp.kill();
};

const generate = async () => {
  await generateSchema(resolve(process.cwd(), `./src/api.json`), {
    dev: true,
    format: true
  });
};

/**
 * @param {CommandConfigReturn} config
 */
const start = async (args: Argv<CommandConfig>) => {
  killProcess();
  // 判断如果platform是server，则执行server端的dev
  // server端的dev指的就是node直接运行index.ts文件
  if (args.platform === 'server') {
    // 入口enrty ts 文件
    indexcp = spawn(
      `node`,
      [
        '--loader',
        '@swordjs/esbuild-register/loader',
        '-r',
        '@swordjs/esbuild-register',
        './src/index.ts',
        `--esbuild-config=${JSON.stringify({
          banner: await getImportCode()
        })}`
      ],
      {
        stdio: 'inherit'
      }
    );
    generateTypeDeclarationsFile();
    // 运行成功
    log.info(`启动入口文件: src/index.ts`);
  } else if (args.platform === 'unicloud') devUnicloudApp(args);
};

/**
 * 生成预先设置的API结构
 * @param {string} sourceDir
 * @param {string} dir
 */
const generatePreset = async (sourceDir: string, parentDir: string, dir: string) => {
  // 删除前缀后的root根节点路由
  const _dir = dir.slice(1);
  try {
    const [cwd, _parentDir] = await presetApi(sourceDir, parentDir, dir);
    renameSync(resolve(cwd, sourceDir, 'api', ..._parentDir, dir), resolve(cwd, sourceDir, 'api', ..._parentDir, _dir));
  } catch (error) {
    return log.err(`API创建失败, ${error as Error}`);
  }
  return log.info(`${_dir} API创建成功，已自动生成index.ts,proto.ts`);
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
              await generatePreset('src', parentDir, dir);
            }
            break;
          case 'change':
            log.info(`[重新编译]触发文件:${path}`);
        }
        await generate();
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
  await generate();
  start(args);
  listenIndex(args);
  // 监听资源文件夹下的api文件夹
  listenApiSource(args);
};
