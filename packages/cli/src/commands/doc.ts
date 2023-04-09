import { writeFileRecursive } from '~util/file';
import { generateSchema } from '../core/api';
import { getApiMap } from '@runtime/core/map';
import log from '../core/log';
import { resolve } from 'path';
import { OpenAPIV3_1 } from 'openapi-types';
import { getPackageJson } from '~util/package';
import { configData } from '../core/config';
import { t } from '../i18n/i18n-node';
import type Mri from 'mri';
import type { CommandConfig } from '~types/config';
import type { Map } from '@runtime/core/map';

type AccepptProtoName = ['ReqParams', 'ReqQuery', 'Res'];

type Proto = {
  type: string;
  comment?: string;
  properties?: {
    id: number;
    name: string;
    optional?: boolean;
    type: {
      type: string;
      comment?: string;
    };
  }[];
  [key: string]: unknown;
};

export type PropertiesAstReturn = {
  id: number;
  name: string | null;
  type: {
    type: string;
    title?: string;
    desc?: string;
    optional?: boolean;
  };
}[];

export type TransProtoReturn = {
  url: string;
  title?: string;
  desc?: string;
  ReqParams: PropertiesAstReturn;
  ReqQuery: PropertiesAstReturn;
  Res: PropertiesAstReturn;
};

const accepptProtoNames: AccepptProtoName = ['ReqParams', 'ReqQuery', 'Res'];

// Define apimap
let apiMap: Record<string, Map> = {};
// Define an object with parent route as key and value as markdown document
const markdownMap: Record<string, string> = {};

// Define a json in openapi format
const openApiJson: OpenAPIV3_1.Document = {
  openapi: '3.0.1',
  info: {
    title: '',
    description: '',
    version: ''
  },
  tags: [],
  paths: {},
  components: {
    schemas: {}
  }
};

export default async (args: Mri.Argv<CommandConfig>) => {
  try {
    log.info(t.Start_Generate_Documentation());
    // Generate api data to get detailed api information such as indicators
    const { apiMap: map } = await getApiMap();
    apiMap = map;
    // Generating ast data
    const { apiResult } = await generateSchema(null, {
      keepComment: true
    });
    for (const key in apiResult) {
      // key for api
      // The first route after the api is resolved by key is used as the parent route
      const parentRoute = key.split('/')[2];
      if (!markdownMap[parentRoute]) {
        markdownMap[parentRoute] = ``;
      }
      const protoData = apiResult[key].proto;
      const result: TransProtoReturn = {
        url: key,
        ReqParams: [],
        ReqQuery: [],
        Res: []
      };
      transAst(protoData, result);
      // Compiling markdown documents
      markdownMap[parentRoute] += await compileMarkdown(result, markdownMap[parentRoute]);
      // Compiling openapi documentation
      openApiJson.paths![key] = await compileOpenApi(result, parentRoute);
      // Write a parentRoute to the tags field in openapi
      if (!openApiJson.tags!.find((t) => t.name === parentRoute)) {
        openApiJson.tags!.push({
          name: parentRoute
        });
      }
    }
    outputMarkdown();
    outputOpenApi();
    // Processing packagejson
    const packageData = getPackageJson();
    if (packageData) {
      const { package: packageInfo } = packageData;
      // Assign a value to openapi's info
      for (const key in openApiJson.info) {
        if (packageInfo[key]) {
          (openApiJson.info as any)[key] = packageInfo[key];
        }
      }
    } else {
      log.err(t.PackageJson_Not_Found());
    }
  } catch (error) {
    log.err(t.Generate_Documentation_Error());
    throw new Error(error as any);
  }
};

/**
 * Converting data from ast
 *
 * @param {Record<string, unknown>} protoData
 * @param {TransProtoReturn} result
 */
const transAst = async (protoData: Record<string, unknown>, result: TransProtoReturn) => {
  for (const protoKey in protoData) {
    const proto = protoData[protoKey] as Proto;
    for (const acceptProtoName of accepptProtoNames) {
      // Screening of qualified proto
      if (protoKey.endsWith(acceptProtoName)) {
        // Parsing Notes
        parseComment(proto, result, acceptProtoName);
      }
    }
  }
};

/**
 * Parsing multi-line comments
 *
 * @param {(string | undefined)} comment
 * @return {*}
 */
const parseMultiLineComment = (comment: string | undefined) => {
  if (comment) {
    const commentArr = comment.split('\n');
    return [commentArr[0], commentArr.slice(1).join('\n')];
  } else {
    return ['暂无', '暂无'];
  }
};

/**
 * Parsing Notes
 *
 * @param {Proto} proto
 * @param {TransProtoReturn} result
 * @param {AccepptProtoName[number]} acceptProtoName
 * @return {*}
 */
const parseComment = (proto: Proto, result: TransProtoReturn, acceptProtoName: AccepptProtoName[number]) => {
  // If the current node is params, set title, desc, etc. when parsing the top-level annotation, because the top level of params represents the entire interface description
  // Splitting comments by line breaks
  const [title, desc] = parseMultiLineComment(proto.comment);
  if (acceptProtoName === 'ReqParams') {
    result.title = title;
    result.desc = desc;
  } else {
    // If there are top-level comments and no properties, it means it is a type alias and the user uses the top-level comments to represent the type alias
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

  // After parsing the top-level annotations, you have to parse the fields of the specific proto properties
  if (proto.properties) {
    for (const key in proto.properties) {
      const property = proto.properties[key];
      // Determine if type exists in property
      const [title, desc] = parseMultiLineComment(property.type.comment);
      result[acceptProtoName].push({
        id: property.id,
        name: property.name,
        type: {
          type: property.type.type,
          title,
          desc,
          optional: property.optional
        }
      });
    }
  }
  return result;
};

/**
 * Compiling markdown documents
 *
 * @param {TransProtoReturn} result
 * @param {string} markdown
 * @return {*}
 */
const compileMarkdown = async (result: TransProtoReturn, markdown: string) => {
  // Determine if there is a markdown configuration in config
  if (configData.value.doc.markdown) {
    return await configData.value.doc.markdown.compile(result, markdown, { apiMap });
  }
  const handleMarkdownTable = (data: PropertiesAstReturn) => {
    return data
      .map(
        (item) =>
          `| ${!item.type.optional && item.name ? '*' : ''}${item.name || '暂无'} | ${item.type.type} | ${item.type.title || '暂无'} | ${item.type.desc} |`
      )
      .join('\n');
  };
  // Spliced content
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

/**
 * Compiling openapi
 *
 * @param {TransProtoReturn} result
 * @param {string} parentRoute
 * @return {*}  {OpenAPIV3_1.Document['paths']}
 */
const compileOpenApi = (result: TransProtoReturn, parentRoute: string): OpenAPIV3_1.Document['paths'] => {
  const apiResult: OpenAPIV3_1.Document['paths'] = {};
  const assignObjArray = (data: Record<string, unknown>[]) => {
    const res: any = {};
    // Loop data
    for (const item of data) {
      for (const key in item) {
        res[key] = item[key];
      }
    }
    return res;
  };
  // key is the methods of the api
  apiMap[result.url].method.map((m) => {
    apiResult[m.toLowerCase()] = {
      summary: result.title,
      description: result.desc,
      parameters: result.ReqQuery.map((query) => {
        return {
          name: query.name,
          title: query.type.title,
          description: query.type.desc,
          in: 'query',
          required: !query.type.optional,
          schema: {
            type: query.type.type.toLowerCase() as any
          }
        };
      }) as any,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: assignObjArray(
                result.ReqParams.map((param) => {
                  return {
                    [param.name as any]: {
                      title: param.type.title,
                      description: param.type.desc,
                      type: param.type.type.toLowerCase() as any
                    }
                  };
                })
              ),
              required: result.ReqParams.filter((param) => !param.type.optional && param.name).map((param) => param.name)
            }
          }
        }
      },
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: assignObjArray(
                  result.Res.map((res) => {
                    return {
                      [res.name as any]: {
                        title: res.type.title,
                        description: res.type.desc,
                        type: res.type.type.toLowerCase() as any
                      }
                    };
                  })
                ),
                required: result.Res.filter((param) => !param.type.optional && param.name).map((param) => param.name)
              }
            }
          }
        }
      }
    };
  });
  return apiResult;
};

/**
 * Export markdown documents to the specified directory
 *
 * @return {*}
 */
const outputMarkdown = async () => {
  if (configData.value.doc.markdown) {
    return configData.value.doc.markdown.output(markdownMap);
  }
  let str = '';
  for (const key in markdownMap) {
    // Splicing parent headers to markdown
    str += `## ${key} \n ${markdownMap[key]}`;
  }
  await writeFileRecursive(resolve(process.cwd(), `docs`, `api.md`), str);
  log.success(t.Generate_Markdown_Documentation_Success());
};

/**
 * Export openapi documents to the specified directory
 *
 */
const outputOpenApi = async () => {
  await writeFileRecursive(resolve(process.cwd(), `docs`, `openapi.json`), JSON.stringify(openApiJson));
  log.success(t.Generate_Openapi_Json_Success());
};
