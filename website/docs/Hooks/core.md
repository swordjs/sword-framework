---
id: core
title: core
url: https://www.yuque.com/mlgrgm/lrf0ra/womuuz
---

<a name="RCDwW"></a>

## useApi

- 用于定义一个路由函数入口, 你可以传入一个[指示器](../快速开始/指示器.md)以及一个回调函数handler <a name="tfbn1"></a>

### 函数签名

```typescript
declare const useApi: <C extends ContextData>(params: {
    instruct?: HttpInstructReturn | HttpInstructReturn[] | undefined;
    handler: HttpApiHandler<C>;
}) => HttpApiReturn<C>;
```

<a name="ozzWE"></a>

### 栗子🌰

```typescript
import { useApi } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: (ctx) => {
    return {
      message: 'hello'
    };
  }
});

```

> ps: useApi的更多demo你可以在[指示器](../快速开始/指示器.md)中查阅到

<a name="PZx1K"></a>

## useApp

- 用户定义sword程序的初始化函数, useApp在内部会执行几个关键流程且返回一个app对象, 在对象中我们可以调用\_start\_, *implementApi等函数* <a name="a9OX2"></a>

### 函数签名

```typescript
declare type AppReturn = {
    implementApi: () => Promise<void>;
    server: {
        start: () => void;
    };
};
declare const useApp: () => Promise<AppReturn>;
```

<a name="UvWN7"></a>

### 栗子🌰

```typescript
import { useApp } from '@swordjs/sword-framework';

const init = async () => {
  const app = await useApp();
  await app.implementApi();
  // 启动服务器
  app.server.start();
};

init();

```

<a name="L5Uaz"></a>

## usePipeline

- 初始化pipeline管道的函数, 在返回的对象可以实现: 添加事件回调到指定管道中 <a name="tCSQq"></a>

### 函数签名

```typescript
declare const usePipeline: <T extends HttpContext<ContextData> = HttpContext<ContextData>>() => (type: PipelineTypeKeys, cb: PipelineNode<T>) => void;
```

<a name="Wjhdk"></a>

### 栗子🌰

```typescript
import { usePipeline } from '@swordjs/sword-framework';

const pipeline = usePipeline()

// node1
pipeline('preApiCall', (ctx) => {
  ctx.return = {
    data: {
      success: true
    }
  }
  return ctx;
})

// node2
pipeline('preApiCall', (ctx) => {
  return null;
})

// node3
pipeline('preApiCall', (ctx) => {
  return null;
})
```

> ps: usePipeline的更多demo你可以在[中间件](../中间件/Pipeline.md)中查阅到

<a name="FlRp9"></a>

## usePlugin

- 使用插件, 返回的对象可以实现添加插件的功能 <a name="Ym7pX"></a>

### 函数签名

```typescript
declare const usePlugin: () => {
    add: (plugin: Plugin | (() => Plugin)) => Plugin[];
};
```

<a name="TqeaE"></a>

### 栗子🌰

```typescript
import { useApp, usePlugin } from '@swordjs/sword-framework';

const plugin = usePlugin();

plugin.add(一个插件对象);
```

> ps: usePlugin的更多demo你可以在[插件系统](../插件系统.md)中查阅到

<a name="Q9wS5"></a>

## useGetApiMap

- 用于sword中运行时所需要的抽象方法, 获取当前应用程序的api map树 <a name="xIF5p"></a>

### 函数签名

```typescript
declare const useGetApiMap: (params?: {
    dir?: string | undefined;
    apiDir?: string | undefined;
    apiPath?: string | undefined;
} | undefined) => Promise<{
    apiMap: Record<string, Map>;
}>;
```

<a name="iB1jE"></a>

### 栗子🌰

```typescript
import { useGetApiMap } from '@swordjse/sword-framework';

const { apiMap } = await useGetApiMap()
```

<a name="NYsxI"></a>

## usePlatform

- 获取当前运行时环境 <a name="XSGnt"></a>

### 函数签名

```typescript
type CommandConfig = {
  platform: 'server' | 'unicloud';
};

declare const usePlatform: () => CommandConfig['platform'];
```

<a name="jQquv"></a>

### 栗子🌰

```typescript
const platform = usePlatform()
// platform 此时就是运行时环境, 你可以在代码中编写多平台的代码
```

<a name="ie4E0"></a>

## usePlatformHook

- 我们在编写多平台的代码时,  会有大量的判断运行时环境, 所以这个hook将帮助你写出更优雅的代码, 我们只需要传给这个函数对应的回调, 它就可以在对应平台之上执行对应的回调 <a name="fKcJy"></a>

### 函数签名

```typescript
declare const usePlatformHook: <R = any>(params: Partial<Record<"server" | "unicloud", () => R | Promise<R>>>, platform?: "server" | "unicloud") => Promise<R | undefined>;
```

<a name="FtZ9R"></a>

### 栗子🌰

```typescript
await usePlatformHook({
  server: () => {

  },
  unicloud: () => {
    
  }
})
```

> ps: 我们也可以传递函数的的第二个参数, 即强指定当前运行时环境, 而不是函数默认获取
> ps: 在较新的版本中, 支持使用[条件编译](../快速开始/条件编译.md)功能来完成更优雅的操作, 所以这个API将不会是最优选择

<a name="ZxWhH"></a>

## useIsDev

- 判断运行环境, 是否是dev开发环境 <a name="RQ9BK"></a>

### **函数签名**

```typescript
declare const useIsDev: () => boolean;
```

<a name="oSF5W"></a>

### **栗子🌰**

```typescript
const dev = useIsDev();
```

> ps: 在较新的版本中, 可以直接对**process.env.\_SWORD\_COMMAND**判断来完成更优雅的操作(**0运行时开销**), 所以这个API将不会是最优选择

<a name="AJwnU"></a>

## useIsProd

- 判断运行环境, 是否是prod开发环境 <a name="oimr7"></a>

### 函数签名

```typescript
declare const useIsProd: () => boolean;
```

<a name="CWYs5"></a>

### **栗子🌰**

```typescript
const prod = useIsProd();
```

> ps: 在较新的版本中, 可以直接对**process.env.\_SWORD\_COMMAND**判断来完成更优雅的操作(**0运行时开销**), 所以这个API将不会是最优选择
