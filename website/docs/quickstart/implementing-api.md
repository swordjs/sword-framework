---
id: implementing-api
title: 实现API
url: https://www.yuque.com/mlgrgm/lrf0ra/hmgsra
---

我们在上一章《快速开始》中了解到了开发API必备的proto.ts的作用，在这一章我们需要实现具体的API啦，我们首先建立一个list文件夹到api下，然后在list文件夹下我们需要新建4个API，分别是增删改查。你可能会觉得：“什么？好麻烦啊，我不想手动建立那么多proto和index.ts”，在这里我们可以在dev环境下，去写便捷操作符，cli会检测到操作符并且自动给你生成模板，比如这样：

![屏幕录制2022-04-10 下午2.19.34\_.gif](../assets/hmgsra/1649571818950-f6bfa903-5ec4-4dc1-8825-a5ce245a3a89.gif) <a name="aQHoo"></a>

## Add

接着我们实现一下add接口，我们需要add接口为post请求，并且规定参数必须传递title（string），返回必须是success（boolean）

```typescript

export interface ReqParams {
  title: string;
}
export interface ReqQuery {
  
}
export interface Res {
  success: boolean;
}

```

```typescript

import { useApi, Post } from "@swordjs/sword-framework";
import { ReqQuery, ReqParams, Res } from "./proto";

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  instruct: [Post()],
  handler: (ctx) => {
    return {
      success: true,
    };
  },
});

```

<a name="BS574"></a>

## Update

我们可以在handler去处理我们的add逻辑，比方说调用数据库的save方法等等...，接着我们同样实现一下update接口，update允许我们传递一个新的title和列表的id:

```typescript

export interface ReqParams {
  title: string;
  id: number
}
export interface ReqQuery {

}
export interface Res {
  success: boolean;
}

```

```typescript

import { useApi, Put} from "@swordjs/sword-framework";
import { ReqQuery, ReqParams, Res } from "./proto";

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  instruct: [Put()],
  handler: (ctx) => {
    return {
      success: true,
    };
  },
});

```

<a name="BnKXF"></a>

## Delete

删除接口，我们只需要一个id作为参数就可以了：

```typescript

export interface ReqParams {
  id: number;
}
export interface ReqQuery {

}
export interface Res {
  success: boolean;
}

```

```typescript

import { useApi, Delete } from "@swordjs/sword-framework";
import { ReqQuery, ReqParams, Res } from "./proto";

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  instruct: [Delete()],
  handler: (ctx) => {
    return {
      success: true,
    };
  },
});

```

<a name="aKVRi"></a>

## Query

查询接口，我们希望用户可以用2种方法传递参数，第一种传递方式就是limit/offset，第二种传递方式就是直接传一个page页数，所以需要我们的proto更复杂一点：

```typescript

export type ReqParams = {
  page: number;
} | {
  offset: number;
  limit: number;
}
export interface ReqQuery {

}
export interface Res {
  list: unknown[];
}

```

我们导出了一个类型别名ReqParams，然后我们就可以在接口中，用上下文直接获取到这些参数，但是请注意当类型别名有多个类型选项时，是没有IDE类型提示的，但是框架的类型校验仍然是有效的：

```typescript

import { useApi } from "@swordjs/sword-framework";
import { ReqQuery, ReqParams, Res } from "./proto";

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  handler: (ctx) => {
    return {
      list: ["test"],
    };
  },
});
```

<a name="f1qyB"></a>

## 结束

你可以发现，得益于proto，我们编写的api不用再去校验数据的基本类型，它可以确保你的api实现中的参数是安全可靠的，也能给客户端保证每个接口的返回都是严格类型的，解决了很多前后端联调出现的问题。而且我们把proto单独实现，而不和我们的api耦合也是有原因的：

- 不和业务耦合
- 对之后的proto -> api文档，更友好，可以单独的去解析ast
- 可以和前端共享，甚至是生成前端的api代码（类似TSRPC）

Sword.js的[类型系统](类型系统.md)使用了TSRPC的类型系统核心，它不仅支持ts的基本数据类型，还支持ArrayBuffer、Date和一些工具函数，比如Pick, Partial等等
