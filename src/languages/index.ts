import { useMutation } from '@apollo/client';
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { CREATE_MISSED_LANGUAGE } from '../graphql/queries';

export function useLanguage() {
    const { language } = useContext(LanguageContext);

    const translations = require('./' + language + '/index.json');

    const [createMissedLanguage] = useMutation(CREATE_MISSED_LANGUAGE, {
        onError: () => null,
        ignoreResults: true,
    });

    return (text: string) => {
        if (translations[text]) {
            return translations[text];
        }
        if (language !== 'en' && text && text.match(/\w+/)) {
            createMissedLanguage({
                variables: {
                    language: language,
                    text: text,
                    url: window.location.pathname,
                },
            });
        }

        return text;
    };
}
