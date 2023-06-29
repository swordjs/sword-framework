---
id: type-system
title: 类型系统
url: https://www.yuque.com/mlgrgm/lrf0ra/awmkhe
---

Sword.js的类型系统可以帮助我们使用ts来规定api的输入和输出，这很酷，减少了很多了原先写在业务逻辑的代码，比如：

```typescript
if(typeof code ！== "string") return "code不为string"
```

但是在真实的业务逻辑中，我们会使用各种第三方库来校验数据，但是远远不如ts灵活，这是事实。我们沿用了TSRPC的核心类型系统库，而且会随时和最新的类型库保持同步，在这一篇中，我们主要描述几个类型使用场景（proto.ts），比如我们构造了一个params类型：

```typescript
export interface ReqParams {
  id: number,
  nickname: string,
}
```

然后客户端传递了一个这样的对象：

```json
{
  "id": 1,
  "nickname": "hello",
  "role": "admin"
}
```

客户端在试图改变role的值，不管这个api是否支持role的修改，这个请求就是非法的，所以sword.js会提示客户端，这样的请求是错误的：

```json
{
    "statusCode": 400,
    "statusMessage": "Excess property `role` should not exists.",
    "stack": []
}
```

当然，如果你需要一些自定义类型，你可以这样做

```json
export interface ReqParams {
  id: number,
  nickname: string,
  [key: string]: string
}
```

<a name="Rpd2g"></a>

## 高级类型

你可以把ts的部分类型特性用在proto中，比如

- 逻辑判断，&, |
- 工具类型，Pick、Omit、Overwrite、Partial...
- 组合类型
- 基础类型，数组
- 引用类型
- Date,ArrayBuffer,Uint8Array

你甚至可以进行嵌套：

```json
type X1 = {
    value?: Array<
        { common: string } & (
            { 
                type: 'A', 
                a: string 
            } | { 
                type: 'B', 
                b: string
            }
        )
    > | null;
};
```

sword.js默认使用json进行传输，这也是目前大多主流应用所青睐的，但是二进制传输更小更快，后续团队会考虑多serverless平台，如果没什么大坑，很快就会支持这个功能，并且配套一个前端sdk包。
