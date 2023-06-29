---
id: indicator
title: 指示器
url: https://www.yuque.com/mlgrgm/lrf0ra/hr8g0g
---

指示器是用于路由和handler进行连接的，它可以指定该请求的method以及url，如果你初始化了一个api，那么此时它默认为get请求，url则是你的文件系统url

```json
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

如果你想让这个api同时支持get和post，那么就要显式的指定它们：

```json
import { useApi, Get, Post } from '@swordjs/sword-framework';
import { ReqQuery, ReqParams, Res } from './proto';

export const main = useApi<{
  query: ReqQuery;
  params: ReqParams;
  res: Res;
}>({
  instruct: [Get(), Post()],
  handler: (ctx) => {
    return {
      message: 'hello'
    };
  }
});

```

如果这个api文件在api/list文件夹下，那么url就是/api/list，此时如果你想强制修改路由的url，可以在指示器中指定url，虽然这非常不推荐

```json
instruct: [Get('/rename'), Post()],
```

请注意⚠️ ，当你有多个指示器的时候，虽然它从功能上来说，是可以给多个指示器指定不同的url，比如这样

```json
instruct: [Get('/rename'), Post('/again')],
```

但是在sword实现中，它只会默认取第一个url，即/rename，因为目前在sword中，暂时不支持多指示器多路由这样的功能，并不是技术实现不了，而是因为，这太难维护了；假设一下，当你的项目有10，20个接口的时候，如果你强行设置的url和文件系统生成的url重合了，虽然sword会包容这样的边界情况，但是从维护角度上来说是非常不友好，为此，我专门开了一个[issue](https://github.com/swordCodePractice/sword-framework/issues/3)来讨论这个权衡的问题

所以我们在sword中，应该暂时避免这种写法，尽量使用文件系统生成的url，在后续我们可能会用ide插件解决开发维护难度高的问题，我们现在尽量就使用最佳实践即可，如果你非要设置url，只用给第一个指示器设置path就可以了

```typescript
instruct: [Get('/rename'), Post()],
```

<a name="cMDD0"></a>

## 目前支持的指示器

```typescript
export type HttpInstructMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE';
```
