import { parseCommandArgs } from '../util/config';
import type H3 from '@sword-code-practice/h3';

export let h3: typeof H3;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const h3Setup = async () => {
  if (h3) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h3 = await import('@sword-code-practice/h3');
};
