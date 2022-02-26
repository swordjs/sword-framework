export type HttpInstructMethod = 'all' | 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head' | 'options';
export type HttpInstruct = (path?: string) => {
  method: HttpInstructMethod;
  path?: string;
};
export type HttpApi = (
  instruct: HttpInstruct | HttpInstruct[],
  handler: () => void
) => {
  instruct: any;
};
