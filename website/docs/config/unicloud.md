---
id: unicloud
title: unicloud
url: https://www.yuque.com/mlgrgm/lrf0ra/ngkk5m
---

unicloud配置项, 需要单独在配置文件中编写unicloud对象, 例如:

```typescript
const config: Config = {
  unicloud: {
   
  }
}
```

<a name="wL5HU"></a>

## link

- 类型: *string*
- 默认:  *undefined*
- unicloud本地开发中, 需要使用link属性链接hbuilderx云函数目录, 实现本地运行调试

```typescript
{
  unicloud: {
    link: "/Users/seho/Documents/HBuilderProjects/sword-unicloud-faas/uniCloud-aliyun/cloudfunctions/test"
  }
}
```
