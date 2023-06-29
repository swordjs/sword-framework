---
id: share
title: share
url: https://www.yuque.com/mlgrgm/lrf0ra/gqamwgnw3ugu0d0p
---

sword.js中的share是一大特色, 在后续的框架开发上, 我们致力让开发者有更好的体验以及节约更多的磁盘空间 <a name="BaTJT"></a>

## type

在开源社区中, 我们发表了一个RFC关于前后端类型同步
[\[RFC\] 关于类型声明前后端同步的想法 · Issue #15 · swordjs/sword-framework](https://github.com/swordjs/sword-framework/issues/15)
所以作为我们的临时方案, 尤其是对于全栈工程师来讲, 仅仅需要将api type (proto)转移到它的其他目录(比如前端项目), 我们可以直接在项目根目录运行 (sword-cli v1.6.0+)

```typescript
npx sword share
```

总的来说, 就是share这个命令, 提供了很多内置配置, 允许我们开箱即用使用这个功能, 它的默认配置是这样的:

```typescript
  share: {
    // 输出的share文件夹名称, 这里可以自定义名称
    dirName: "share",
    // 输出文件夹路径
    path: cwd(),
    type: {
      // 类型共享文件夹名称
      dirName: "type",
      // 类型共享文件夹中的package.json内容
      package: {
        name: `${packageData?.package.name}-type`,
        version: packageData?.package.version,
        description: `${packageData?.package.name}-type`
      }
    }
  },
```

我们可以在sword.config.ts中扩展或者改写上述字段, 类型共享的功能仅仅就是将每个api的proto.ts的文件进行重命名, 然后转移到指定目录, 并且cli会生成一个package.json到指定目录中, 以便开发者可以直接将其打包为npm-type-package共享给前端

> 提示: 如果proto.ts存在导入关系, 比如import ** from "other", 那么同样这段代码会被保留在文件中, 总的来说目前的类型共享功能不会对文件的依赖做分析, 在后续的版本中会开源一种类型打包工具, 它将会处理依赖和依赖之间的关系, 并且提取出公共模块. 现有版本中, 请开发者如果要使用此功能, 就不要在proto.ts中引入其他ts作为类型

<a name="ht7mH"></a>

## 类型

```typescript
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
```
