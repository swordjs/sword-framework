// 运行时的log类型, 分为info, success, error
export type LogType = {
  err: (v: string | Error) => void;
  info: (v: string) => void;
  success: (v: string) => void;
};

// 运行时的logger签名
export type Logger = {
  REQUEST_URL: (key: string) => void;
  REQUEST_METHOD_ERROR: (msg: string) => void;
  REQUEST_TYPE_ERROR: (msg: string) => void;
  REQUEST_QUERY: (query: string) => void;
  REQUEST_PARAMS: (query: string) => void;
  EXECUTE_ERROR: (msg: string) => void;
  RESPONSE_RESULT: (msg: string, suffix?: string) => void;
  RESPONSE_TYPE_ERROR: (msg: string) => void;
};
