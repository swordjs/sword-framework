import type { UnicloudContext, UnicloudEvent } from '../../../typings/unicloud';

export let event: UnicloudEvent | null = null;
export let context: UnicloudContext | null = null;

export const setEvent = (_event: UnicloudEvent): void => {
  event = _event;
};

export const setContext = (_context: UnicloudContext): void => {
  context = _context;
};
