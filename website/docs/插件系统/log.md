---
title: log
url: https://www.yuque.com/mlgrgm/lrf0ra/leamvy
---

我们可以自己实现一个log插件，当然sword默认已经包含了一个log插件，所以当你需要定制log功能的时候，你再使用它：

```typescript
import chalk from 'chalk';
import type { Plugin } from '../../../typings/index';

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

使用这个插件：

```typescript
const plugin = usePlugin();

plugin.add(useLogPlugin);
```

<a name="fSpLp"></a>

## 类型

```typescript
log?: {
  err: (v: string | Error) => void;
  info: (v: string) => void;
  success: (v: string) => void;
};
```
