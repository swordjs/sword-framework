import { create, verify } from 'njwt';
import type { Plugin } from '#types/index';

export const useJwt = (): Plugin => {
  return {
    name: 'jwt'
  };
};
