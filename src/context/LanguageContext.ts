import { createContext, Dispatch, SetStateAction } from 'react';

interface LanguageContextI {
    language: string;
    setLanguage: Dispatch<SetStateAction<string>>;
}
export const LanguageContext = createContext({} as LanguageContextI);
