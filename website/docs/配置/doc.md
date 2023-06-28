---
title: doc
url: https://www.yuque.com/mlgrgm/lrf0ra/ag6vglaeprmpb8p7
---

我们在使用sword-cli的doc功能时, 经常苦于文档无法自定义格式, 尤其是markdown, 我们在sword-cli v1.6.0版本中完成了这一需求, 现在需要向开发者阐述如何自定义自己的markdown文档. <a name="YhlYr"></a>

## 配置sword.config.ts

首先, 我们如果要获取到自定义markdown api文档, 我们需要定义**compile**以及**output**函数在sword.config.ts中:

```typescript
import type { Config } from '@swordjs/sword-framework-cli';

const config: Config = {
    doc: {
        markdown: {
            compile: (result, markdown, { apiMap }) => {
                const handleMarkdownTable = (data) => {
                    return data
                        .map(
                            (item) =>
                                `| ${!item.type.optional && item.name ? '*' : ''}${item.name || '暂无'} | ${item.type.type} | ${item.type.title || '暂无'} | ${item.type.desc} |`
                        )
                        .join('\n');
                };
                // 拼接内容
                markdown += `
  ## ${result.title}
  > ${result.desc}

  支持的请求方法：${apiMap[result.url].method.join('，')}
  路由：${result.url}

  ### 请求Params参数
  | 参数名 | 类型 | 名称 | 描述 |
  | ------ | ---- | ---- | ---- |
  ${handleMarkdownTable(result.ReqParams)}

  ### 请求Query参数
  | 参数名 | 类型 | 名称 | 描述 |
  | ------ | ---- | ---- | ---- |
  ${handleMarkdownTable(result.ReqQuery)}

  ### 返回参数
  | 参数名 | 类型 | 名称 | 描述 |
  | ------ | ---- | ---- | ---- |
  ${handleMarkdownTable(result.Res)}
  `;
                return markdown
            },
            output: (markdownMap) => {
                console.log("markdownMap", markdownMap)
            }
        }
    }
};

export default config;

```

<a name="Np2R4"></a>

## compile

首先我们需要了解, 一个doc的组成方式, 在cli中的doc章节中我们已经介绍过, doc是通过api proto的注释去生成的. 事实上我们只需要一个字符串, 然后去循环api tree, 就可以自由组合成我们想要的任何格式.

上面的代码中的**compile**函数, 就是api在迭代时, 我们拼接字符串的过程. 代码示例中我们详细描述了如何拼接字符串, 而且需要注意的是我们在函数最后务必要返回当前迭代的markdown字符串. <a name="OGkUQ"></a>

## output

而**output**函数, 它只会执行一次, 你可以把最终的markdownMap结果集输出成文件到任何地方 <a name="WpCVW"></a>

## 类型

```typescript
  // 编译文档的配置
  doc?: {
    markdown?: {
      // 每一个api都会被调用一次编译函数, 传入的参数是api的信息, 返回的则是现有的markdown文档
      compile: (result: TransProtoReturn, markdown: string, options: { apiMap: Record<string, Map> }) => string,
      output: (markdownMap: Record<string, string>) => void
    }
  }
```
