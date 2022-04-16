import { writeFileRecursive } from './util/file';
import { generateSchema } from './util/proto';
import { getApiMap } from '../../../src/core/map';
import type { Argv } from 'mri';
import type { Config } from '../typings/config';
import type { Map } from '../../../src/core/map';
import { resolve } from 'path';

type AccepptProtoName = ['ReqParams', 'ReqQuery', 'Res'];

type Proto = {
  type: string;
  comment?: string;
  properties?: {
    id: number;
    name: string;
    type: {
      type: string;
      comment?: string;
    };
  }[];
  [key: string]: unknown;
};

type PropertiesAstReturn = {
  id: number;
  name: string | null;
  type: {
    type: string;
    title?: string;
    desc?: string;
  };
}[];

type transProtoReturn = {
  url: string;
  title?: string;
  desc?: string;
  ReqParams: PropertiesAstReturn;
  ReqQuery: PropertiesAstReturn;
  Res: PropertiesAstReturn;
};

const accepptProtoNames: AccepptProtoName = ['ReqParams', 'ReqQuery', 'Res'];

// 定义apimap
let apiMap: Record<string, Map> = {};
// 定义一个以父路由为key，value为markdown文档的对象
const markdownMap: Record<string, string> = {};

export default async (args: Argv<Config>) => {
  // 生成api数据，用于获取指示器等详细api信息
  const { apiMap: map } = await getApiMap();
  apiMap = map;
  // 生成ast数据
  const { protoAst } = await generateSchema(null, {
    keepComment: true
  });
  // 循环ast中的每一个key
  for (const key in protoAst) {
    // key 为 api
    // 判断parentRoute是否存在
    // 通过key解析出api后的第一个路由作为父路由
    const parentRoute = key.split('/')[2];
    if (!markdownMap[parentRoute]) {
      markdownMap[parentRoute] = ``;
    }
    const protoData = protoAst[key];
    const result: transProtoReturn = {
      url: key,
      ReqParams: [],
      ReqQuery: [],
      Res: []
    } as any;
    transAst(protoData, result);
    // 编译markdown文档
    markdownMap[parentRoute] += await compileMarkdown(result, markdownMap[parentRoute]);
  }
  outputMarkdown();
};

// 从ast转换数据
const transAst = async (protoData: Record<string, unknown>, result: transProtoReturn) => {
  for (const protoKey in protoData) {
    const proto = protoData[protoKey] as Proto;
    for (const acceptProtoName of accepptProtoNames) {
      // 筛选合格的proto
      if (protoKey.endsWith(acceptProtoName)) {
        // 解析注释
        parseComment(proto, result, acceptProtoName);
      }
    }
  }
};

// 解析多行注释
const parseMultiLineComment = (comment: string | undefined) => {
  if (comment) {
    const commentArr = comment.split('\n');
    return [commentArr[0], commentArr.slice(1).join('\n')];
  } else {
    return ['暂无', '暂无'];
  }
};

// 解析注释
const parseComment = (proto: Proto, result: transProtoReturn, acceptProtoName: AccepptProtoName[number]) => {
  // 当前如果是params的节点，解析顶层注释时要设置title，desc等等，因为params的顶层代表了整个接口的说明
  // 通过换行符分割注释
  const [title, desc] = parseMultiLineComment(proto.comment);
  if (acceptProtoName === 'ReqParams') {
    result.title = title;
    result.desc = desc;
  } else {
    // 如果存在顶级注释且没有properties，就说明这是一个类型别名，用户使用顶级注释来表示类型别名
    if (proto.comment && !proto.properties) {
      result[acceptProtoName].push({
        id: 0,
        name: null,
        type: {
          type: proto.type,
          title,
          desc
        }
      });
    }
  }

  // 解析完顶层注释之后，就要解析具体proto属性的字段
  if (proto.properties) {
    for (const key in proto.properties) {
      const property = proto.properties[key];
      // 判断property中是否存在type
      const [title, desc] = parseMultiLineComment(property.type.comment);
      result[acceptProtoName].push({
        id: property.id,
        name: property.name,
        type: {
          type: property.type.type,
          title,
          desc
        }
      });
    }
  }
  return result;
};

// 编译markdown文档
const compileMarkdown = async (result: transProtoReturn, markdown: string) => {
  const handleMarkdownTable = (data: PropertiesAstReturn) => {
    return data.map((item) => `| ${item.name || '暂无'} | ${item.type.type} | ${item.type.title || '暂无'} | ${item.type.desc} |`).join('\n');
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
  return markdown;
};

// 输出markdown文档到指定目录
const outputMarkdown = async () => {
  let str = '';
  for (const key in markdownMap) {
    // 给markdown拼接父标题
    str += `## ${key} \n ${markdownMap[key]}`;
  }
  writeFileRecursive(resolve(process.cwd(), `docs`, `api.md`), str);
};
