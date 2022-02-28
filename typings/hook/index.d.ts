export type HttpInstructMethod = 'all' | 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head' | 'options';
export type HttpInstruct = (path?: string) => HttpInstructReturn;
export type HttpInstructReturn = {
  method: HttpInstructMethod;
  path?: string;
};
export type HttpApi = (
  instruct: HttpInstructReturn | HttpInstructReturn[],
  handler: () => void
) => {
  instruct: {
    method: HttpInstructMethod | HttpInstructMethod[];
    path?: string;
  };
  handler: () => void;
};
