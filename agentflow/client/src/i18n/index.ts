import { useCallback } from 'react';
import { useStore } from '../state/store';
import type { TranslationKey, Translations } from './en';
import en from './en';
import ar from './ar';
import zh from './zh';
import bg from './bg';

export type Language = 'en' | 'ar' | 'zh' | 'bg';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'bg', label: 'Български' },
];

export const dictionaries: Record<Language, Translations> = { en, ar, zh, bg };

export function useT() {
  const language = useStore((s) => s.language);
  const dict = dictionaries[language];

  return useCallback(
    (key: TranslationKey, vars?: Record<string, string>): string => {
      let text = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    },
    [dict],
  );
}

export type { TranslationKey, Translations };
