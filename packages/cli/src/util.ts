import log from './core/log';
import schema2interface from './util/schema2interface';
import clearShim from './util/clearShim';
import presetApi from './util/presetApi';
import { t } from './i18n/i18n-node';
import type { Argv } from 'mri';
import type { CommandConfig } from '~types/config';

export default async (args: Argv<CommandConfig>) => {
  // Determines if the util-name is specified
  if (!args['util-name']) {
    log.err(t.Util_Name_Is_Required());
  } else {
    // Define an object that stores and matches all the util functions
    const utilHandler = {
      schema2interface,
      clearShim,
      presetApi
    };
    // Determine if the util-name is in the utilHandler
    if (utilHandler[args['util-name']]) {
      // If in, then execute the util-name in the utilHandler
      utilHandler[args['util-name']](args);
    } else {
      // If not, an error is reported
      log.err(t.Util_Name_Not_Found(args['util-name']));
      // Check the documentation for supported util-names
      log.info(`${t.Util_Name_Not_Found_Hint()}: https://www.yuque.com/mlgrgm/lrf0ra/lywbzt`);
    }
  }
};
