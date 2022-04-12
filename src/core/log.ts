import { aggregatePlugin } from './plugin';
import type { Plugin } from './../../typings/index';

// log模块不会为空，因为log模块就算用户没有注册，也会有一个默认的log模块
export const log: () => Required<Plugin>['log'] = () => {
  return aggregatePlugin ? aggregatePlugin.log.plugin : {};
};
