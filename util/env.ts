import { env } from '~types/env';

export const isDev = () => process.env[env.swordCommand] === 'dev';
export const isProd = () => process.env[env.swordCommand] === 'build';
