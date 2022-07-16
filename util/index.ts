export const debounce = (fn: (...params: any[]) => any, delay: number) => {
  let timer: any = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    } // eslint-disable-next-line prefer-spread
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const throttle = (fn: (...params: any[]) => any, delay: number) => {
  let timer: any = null;
  return (...args: any[]) => {
    if (timer) return;
    timer = setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      fn.apply(null, args);
      clearTimeout(timer);
    }, delay);
  };
};

export const camelCase = (name: string) => {
  const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  const MOZ_HACK_REGEXP = /^moz([A-Z])/;
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};
