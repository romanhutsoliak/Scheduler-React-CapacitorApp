import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export function useLanguage() {
    const { language } = useContext(LanguageContext);

    const translations = require('./' + language + '/index.json');

    return (text: string) => {
        if (translations[text]) {
            return translations[text];
        }
        if (language !== 'en' && text.match(/\w+/))
            console.log('"' + text + '": "",');
        return text;
    };
}
