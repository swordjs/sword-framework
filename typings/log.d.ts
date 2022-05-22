export type Logger = {
  REQUEST_URL: (key: string) => void;
  REQUEST_METHOD_ERROR: (msg: string) => void;
  REQUEST_TYPE_ERROR: (msg: string) => void;
  REQUEST_QUERY: (query: string) => void;
  REQUEST_PARAMS: (query: string) => void;
  RESPONSE_RESULT: (msg: string, suffix?: string) => void;
  RESPONSE_TYPE_ERROR: (msg: string) => void;
};
