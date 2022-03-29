import './pipeline';
import './config';
import './hook';

export type UnPromisify<T> = T extends Promise<infer U> ? U : never;
