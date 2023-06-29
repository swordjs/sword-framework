---
id: unicloud
title: unicloud
url: https://www.yuque.com/mlgrgm/lrf0ra/ogboxn
---

<a name="lTgvN"></a>

## useUnicloudUrlEvent

- 用于获取unicloud平台云函数url化之后的[集成请求event](https://uniapp.dcloud.io/uniCloud/http.html#input) <a name="TdeBc"></a>

### **函数签名**

```typescript
type UnicloudUrlOriginEvent = {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  isBase64Encoded: boolean;
  body: string;
};

declare const useUnicloudUrlEvent: () => UnicloudUrlOriginEvent | undefined;
```

<a name="BxZ6Y"></a>

### **栗子🌰**

```typescript
const originUrlEvent = useUnicloudUrlEvent()
```

<a name="qPBlT"></a>

## useUnicloudContext

- 用于获取unicloud平台的源context上下文, 在源context中你可以获取到关于unicloud运行时的任何context配置 <a name="FGHfS"></a>

### **函数签名**

```typescript
type UnicloudOriginContext = {
  APPID?: string;
  SOURCE: 'server' | 'http' | 'client';
  CLIENTIP: string;
  CLIENTUA: string;
  OS?: unknown;
  PLATFORM?: unknown;
  SPACEINFO: {
    provider: 'aliyun' | 'tencent';
    spaceId: string;
  };
  DEVICEID?: undefined;
  FUNCTION_NAME: string;
  LOCALE?: unknown;
};

declare const useUnicloudContext: () => UnicloudOriginContext;
```

<a name="EXz6s"></a>

### **栗子🌰**

```typescript
const originContext = useUnicloudContext()
```

<a name="vpnlu"></a>

## **useUnicloudTriggerApi ( 内部函数 )**

- 用于触发unicloud的入口函数, 它是一个内部核心hook, 在你主动的编写代码中, 很可能见不到它, 但是它多次出现在unicloud环境的产物中, 它是由sword编译器自动shim到你的应用程序中的 <a name="P5u0J"></a>

### **函数签名**

```typescript
declare const useUnicloudTriggerApi: (event: UnicloudEvent, context: UnicloudContext, apiMap: Record<string, Map>) => ErrorResponse | Promise<void | ErrorResponse>;
```

<a name="uxejJ"></a>

### **栗子🌰**

```typescript
module.exports = async (event, context) => {
  const { apiMap } = await import_sword_framework.useGetApiMap()
  return import_sword_framework.useUnicloudTriggerApi(event, context, apiMap)
}
```

> ps: 实例代码存在于unicloud环境下的index.js之中

<a name="yXRSQ"></a>

## **useUnicloudValidateEvent (内部函数)**

- 用于在unicloud平台校验event参数 <a name="YQf6d"></a>

### **函数签名**

```typescript
declare const useUnicloudValidateEvent: (event: UnicloudEvent) => true | ErrorReturn;
```

<a name="TxRr2"></a>

### **栗子🌰**

```typescript
const validateResult = import_sword_framework.useUnicloudValidateEvent(event);
// 判断校验结果是否严格等于true
if (validateResult !== true) {
  return validateResult;
}
```

> ps: 实例代码存在于unicloud环境下的index.js之中
