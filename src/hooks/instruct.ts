import type { HttpInstruct } from '../../typings/hook/index';

export const Get: HttpInstruct = (path) => {
  return {
    method: 'get'
  };
};

export const Post: HttpInstruct = (path) => {
  return {
    method: 'post'
  };
};

export const Patch: HttpInstruct = (path) => {
  return {
    method: 'patch'
  };
};

export const Put: HttpInstruct = (path) => {
  return {
    method: 'put'
  };
};

export const Delete: HttpInstruct = (path) => {
  return {
    method: 'delete'
  };
};

export const Head: HttpInstruct = (path) => {
  return {
    method: 'head'
  };
};

export const Options: HttpInstruct = (path) => {
  return {
    method: 'options'
  };
};
