---
id: command
title: 命令行配置
url: https://www.yuque.com/mlgrgm/lrf0ra/ogmqsv
---

在命令行章节, 会把在sword-cli中所有命令行参数进行归纳整理 <a name="uPih1"></a>

## platform

- 指定当前cli运行环境
- 可取值: *server, unicloud*
- 默认值: *server*

```json
"scripts": {
  "dev:unicloud": "sword dev --platform=unicloud",
}
```

<a name="ksATP"></a>

## util-name

- 指定sword util命令的util-name名称, 用于cli执行某项已定义的功能
- 可取值: *schema2interface*
- 默认值: *null*

```json
"scripts": {
  // 作为demo, schema2interface是特殊的工具, 所以它必须指定platform
  // 在使用时你需要阅读util文档, 查看每个工具的适用平台, 以免报错
  "util:schema2interface": "sword util --util-name=schema2interface --platform=unicloud",
}
```
