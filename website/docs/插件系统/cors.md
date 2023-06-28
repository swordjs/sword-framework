---
title: cors
url: https://www.yuque.com/mlgrgm/lrf0ra/sw0ek3
---

如果你运行nodejs程序部署到任何平台，你可能都需要完成对cors的设置，为了降低开发门槛，也考虑到cors这个需求非常常见，所以我们帮助用户实现了cors插件，但是请注意，它并不会包括在sword中，需要你手动安装并且引入。

<a name="Cgz62"></a>

## 安装

```shell
pnpm i @swordjs/sword-cors
```

<a name="Q8NtM"></a>

## 使用

```typescript
import { useApp, usePipeline, usePlugin } from '@swordjs/sword-framework';
import { useCorsPlugin } from "@swordjs/sword-cors"

const plugin = usePlugin();
const pipeline = usePipeline();

plugin.add(useCorsPlugin());

const app = useApp();
```

此时你的返回头是这样的：

```typescript
{
  'Access-Control-Allow-Origin': '*'
}
```

如果你要设置resheader origin为https://www.baidu.com，你可以在pipeline中手动实现，也可以这样：

```typescript
plugin.add(useCorsPlugin({
  'Access-Control-Allow-Origin': 'https://www.baidu.com'
}));
```

插件支持你传入一个resheaders，理论上你可以设置任何返回头
