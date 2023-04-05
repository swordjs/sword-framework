import { i18n } from './i18n-util';
import { loadLocale } from './i18n-util.sync';
import type { LocaleTranslationFunctions } from 'typesafe-i18n';
import type { Locales, Translations, TranslationFunctions } from './i18n-types';

export let t: LocaleTranslationFunctions<Locales, Translations, TranslationFunctions>['en'];

export const loadI18n = (locale: Locales) => {
  loadLocale(locale);
  t = i18n()[locale];
};
