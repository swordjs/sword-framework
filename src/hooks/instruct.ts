import type { HttpInstruct } from '../../typings/hook/index';

export const Get: HttpInstruct = (path) => {
  return {
    method: 'get',
    path
  };
};

export const Post: HttpInstruct = (path) => {
  return {
    method: 'post',
    path
  };
};

export const Patch: HttpInstruct = (path) => {
  return {
    method: 'patch',
    path
  };
};

export const Put: HttpInstruct = (path) => {
  return {
    method: 'put',
    path
  };
};

export const Delete: HttpInstruct = (path) => {
  return {
    method: 'delete',
    path
  };
};

export const Head: HttpInstruct = (path) => {
  return {
    method: 'head',
    path
  };
};

export const Options: HttpInstruct = (path) => {
  return {
    method: 'options',
    path
  };
};
