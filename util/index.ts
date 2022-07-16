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
