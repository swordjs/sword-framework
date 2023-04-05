import log from './core/log';
import schema2interface from './util/schema2interface';
import clearShim from './util/clearShim';
import presetApi from './util/presetApi';
import { t } from './i18n/i18n-node';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

export default async (args: Argv<CommandConfig>) => {
  // 判断是否指定了util-name
  if (!args['util-name']) {
    log.err(t.Util_Name_Is_Required());
  } else {
    // 定义一个对象, 存储和匹配所有的util函数
    const utilHandler = {
      schema2interface,
      clearShim,
      presetApi
    };
    // 判断util-name是否在utilHandler中
    if (utilHandler[args['util-name']]) {
      // 如果在，则执行utilHandler中的util-name
      utilHandler[args['util-name']](args);
    } else {
      // 如果不在，则报错
      log.err(t.Util_Name_Not_Found(args['util-name']));
      // 查阅文档查看支持的util-name
      log.info(`${t.Util_Name_Not_Found_Hint()}: https://www.yuque.com/mlgrgm/lrf0ra/lywbzt`);
    }
  }
};
