import { ConditionCommentMacroPlugin } from '@swordjs/esbuild-plugin-condition-comment-macro';
import { env } from '~types/env';
import type { CommandConfig } from '~types/config';

/**
 * esbuild plugin, for conditional compilation
 * @param platform
 * @returns
 */
export const esbuildPluginConditionalCompiler = (platform: CommandConfig['platform']) => {
  return ConditionCommentMacroPlugin({
    prefix: '@',
    startMacro: {
      ifdef: ({ match, args, reg }) => (args.includes(platform) ? match : match.replace(reg, '')),
      ifndef: ({ match, args, reg }) => (args.includes(platform) ? match.replace(reg, '') : match)
    },
    endMacro: 'endif'
  })();
};

export const esbuildDefineConditionalCompiler = (platform: CommandConfig['platform']): Record<string, string> => {
  return {
    [`process.env.${env.swordPlatform}`]: `'${platform}'`
  };
};
