---
id: config
title: 配置
url: https://www.yuque.com/mlgrgm/lrf0ra/kvlzgp
---

sword的配置主要用于修改sword程序的构建时, 运行时的状态, 那么得益于[unconfig](https://github.com/antfu/unconfig)我们可以使用很多种方式配置我们的工程, 比如: sword.config.('ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json') 放置在我们的根目录即可, 有时候你不想使用单独的文件保存配置, 你也可以直接在package.json中定义一个顶级对象, 这也是有效的:

```bash
"scripts": {},
"sword": {
  ......
}
```

不过我们还是非常建议你使用ts来构建的配置项, 因为你将会获得最棒的类型提示

```typescript
import type { Config } from "@swordjs/sword-framework-cli"

const config: Config = {
  
}

export default config;

```

在配置篇中, 将会陈列公开的配置项以及说明, 以及特定平台的配置项, 这一章也将会是你之后反复查阅的宝贵资料