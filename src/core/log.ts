import { aggregatePluginBehavior } from './plugin';
import type { Plugin } from '@sword-code-practice/types/sword-backend-framework';

// log模块不会为空，因为log模块就算用户没有注册，也会有一个默认的log模块
export const log: Required<Plugin>['log'] = aggregatePluginBehavior().log.plugin;
