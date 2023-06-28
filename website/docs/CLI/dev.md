---
title: dev
url: https://www.yuque.com/mlgrgm/lrf0ra/gn5mia
---

```bash
sword dev
```

开发时运行sword程序, 但是运行要区分环境, 如果你没有指定[platform参数](../配置/命令行配置.md), 那么它就是在server端运行 <a name="KbqqH"></a>

## 平台差异

| 平台名称 | 表现 |
| --- | --- |
| server | 使用esbuild直接运行ts -> 不会缓存任何文件 -> 运行在本地的httpserver中 |
| unicloud | 使用esbuild编译ts -> 会缓存文件 -> 不会运行在本地的httpserver中 |
