import { generateSchema } from './util/proto';
import type { Argv } from 'mri';
import type { Config } from '../typings/config';

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
  name: string;
  type: {
    type: string;
    title?: string;
    desc?: string;
  };
}[];

type transProtoReturn = {
  title?: string;
  desc?: string;
  ReqParams: PropertiesAstReturn;
  ReqQuery: PropertiesAstReturn;
  Res: PropertiesAstReturn;
};

const accepptProtoNames: AccepptProtoName = ['ReqParams', 'ReqQuery', 'Res'];

export default async (args: Argv<Config>) => {
  // 生成ast数据
  const { protoAst } = await generateSchema(null, {
    keepComment: true
  });
  // 循环ast中的每一个key
  for (const key in protoAst) {
    // key 为 api
    const protoData = protoAst[key];
    const result: transProtoReturn = {
      ReqParams: [],
      ReqQuery: [],
      Res: []
    } as any;
    transAst(protoData, result);
    console.log(result);
  }
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
const parseMultiLineComment = (comment: string) => {
  const commentArr = comment.split('\n');
  return commentArr;
};

// 解析注释
const parseComment = (proto: Proto, result: transProtoReturn, acceptProtoName: AccepptProtoName[number]) => {
  // 当前如果是params的节点，解析顶层注释时要设置title，desc等等，因为params的顶层代表了整个接口的说明
  if (acceptProtoName === 'ReqParams') {
    if (proto.comment) {
      // 通过换行符分割注释
      const [title, desc] = parseMultiLineComment(proto.comment);
      result.title = title;
      result.desc = desc;
    }
  }
  // 解析完顶层注释之后，就要解析具体proto属性的字段
  if (proto.properties) {
    for (const key in proto.properties) {
      const property = proto.properties[key];
      // 判断property中是否存在type
      let type;
      // if (typeof property.type === 'string') {
      //   type = property.type;
      // }
      if (property.type.comment) {
        const [title, desc] = parseMultiLineComment(property.type.comment);
        result[acceptProtoName].push({
          id: property.id,
          name: property.name,
          type: {
            type: type || property.type.type,
            title,
            desc
          }
        });
      }
    }
  }
  return result;
};

// 编译markdown文档
const compileMarkdown = async () => {};
