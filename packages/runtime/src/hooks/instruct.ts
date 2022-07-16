import type { HttpInstruct } from '#types/index';

export const Get: HttpInstruct = (path) => {
  return {
    method: 'GET',
    path
  };
};

export const Post: HttpInstruct = (path) => {
  return {
    method: 'POST',
    path
  };
};

export const Put: HttpInstruct = (path) => {
  return {
    method: 'PUT',
    path
  };
};

export const Delete: HttpInstruct = (path) => {
  return {
    method: 'DELETE',
    path
  };
};

export const Head: HttpInstruct = (path) => {
  return {
    method: 'HEAD',
    path
  };
};

export const Options: HttpInstruct = (path) => {
  return {
    method: 'OPTIONS',
    path
  };
};

export const Trace: HttpInstruct = (path) => {
  return {
    method: 'TRACE',
    path
  };
};

export const Connect: HttpInstruct = (path) => {
  return {
    method: 'CONNECT',
    path
  };
};
