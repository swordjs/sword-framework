---
id: plugins
title: 插件系统
url: https://www.yuque.com/mlgrgm/lrf0ra/mwtkkf
---

你可能会发现，sword的代码仓库使用了monorepo，在[packages](https://github.com/swordCodePractice/sword-framework/tree/master/packages)这个目录中，我们定义了很多官方插件，比如在server中的运行时，比如log插件，它们都有自己的作用，而这些插件都是基于sword插件系统上实现的。
在这一章节中，我们将会简单了解sword插件系统是什么样子的，它提供了一些什么功能？

<a name="yCGZN"></a>

## 插件Root概览

| Root名称 | 介绍 | 是否允许多次注册 |
| --- | --- | --- |
| server | 运行在nodejs服务器的基座插件 | 否 |
| log | 运行在nodejs服务器的日志插件 | 否 |
| context | 修改api传输中的上下文 | 否 |
| preApi | 可以在插件中注册多个preApi数组, 用于在函数handler执行之前, 将你注册数组入栈, 底层是preApiPipeline | 是 |
| postApi | 可以在插件中注册多个postApi数组, 用于在函数handler执行之后, 将你注册数组入栈, 底层是postApiPipeline | 是 |

<a name="RxuOC"></a>

## 如何写一个插件

在sword中提供了很多root节点，比如log 节点，server节点，在sword运行时中，会注册插件，并且在运行过程中把对应方法执行时机交由插件实现，听起来很简单，做起来也很简单，这是一个插件的类型：

```json
export type Plugin = {
  name: string;
  // 提供几个钩子用来定义函数，作为框架runtime的shim
  server?: {
    start: (...args: any[]) => Promise<void> | void;
  };
  log?: {
    err: (v: string | Error) => void;
    info: (v: string) => void;
    success: (v: string) => void;
  };
  // 还有其他的root节点，具体内容参见插件系统的子文档
};

```

可以清楚的看到，有一个plugin name，这个name主要用在日志上，可以打印出某个时机执行的逻辑是由sword本身实现的，还是某个插件实现的，这可以方便调试，所以name**并不是一个唯一值**。
sword不同于其他框架的插件系统，它可以一个插件同时实现多个root节点，即我写了一个插件叫做：“seho-plugin”，代表了我一个插件实现了多个功能，这样做有一个好处就是，用户在选择插件的时候可以选择又大又全的插件，而不用一个一个添加组合，可以让应用程序的开发始终是“最佳方案”。那么既然一个插件可以实现多个root，那么必然会存在先后顺序的执行问题, 这个时候你需要仔细阅读我们的插件API文档. 在文档中我们规定了每一个root的类型, 在部分root中, 我们采用了**新的root替换旧的root**的规则; 而在其他的root中, 我们的插件可以同时注册root, 按照入栈顺序执行.

所以sword的插件系统给用户了最大的选择权，你可以让你的插件是颗粒度小的，也可以让你的插件是大而全的，所以我们写插件也非常简单，我们只需要导出一个插件对象就可以啦！

下面演示了一个log插件的开发：

```typescript
import chalk from 'chalk';
import type { Plugin } from '@swordjs/sword-framework';

const now = () => {
  const _ = new Date();
  return `${_.getFullYear()}-${_.getMonth() + 1}-${_.getDate()} ${_.getHours()}:${_.getMinutes()}:${_.getSeconds()}`;
};

export const log = {
  err: (v: string | Error): void => {
    console.log(`${chalk.gray(now())} ${v}`);
  },
  info: (v: string): void => {
    console.log(`${chalk.gray(now())} ${chalk.yellow(v)}`);
  },
  success: (v: string): void => {
    console.log(`${chalk.gray(now())} ${chalk.green(v)}`);
  }
};

/**
* 定义终端打印日志插件
* @preset true
* @return {*}
*/
export const useLogPlugin = (): Plugin => {
  return {
    name: 'log',
    log
  };
};

```

<a name="qq8mc"></a>

## 使用插件

```typescript
import { useApp, usePlugin } from '@swordjs/sword-framework';

const plugin = usePlugin();

plugin.add(useLogPlugin);

const app = useApp();

const init = () => {
  // ...
};

init();

```

这里useplugin的类型：

```typescript
declare const usePlugin: () => {
    add: (plugin: Plugin | (() => Plugin)) => Promise<Plugin[]>;
};
```
