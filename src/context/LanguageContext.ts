import { createContext, Dispatch, SetStateAction } from 'react';

export const AVAILABLE_LANGUAGES = ['en', 'ru', 'ua'];

interface LanguageContextI {
    language: string;
    setLanguage: Dispatch<SetStateAction<string>>;
}
export const LanguageContext = createContext({} as LanguageContextI);
