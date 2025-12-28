// Export all translations
export { id, type Translations } from './id';
export { en } from './en';
export { zh } from './zh';
export { ar } from './ar';
export { ru } from './ru';

import { id } from './id';
import { en } from './en';
import { zh } from './zh';
import { ar } from './ar';
import { ru } from './ru';

export type LanguageCode = 'id' | 'en' | 'zh' | 'ar' | 'ru';

export const translations = {
    id,
    en,
    zh,
    ar,
    ru,
} as const;

export const languages: { code: LanguageCode; name: string; flag: string; rtl?: boolean }[] = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];
