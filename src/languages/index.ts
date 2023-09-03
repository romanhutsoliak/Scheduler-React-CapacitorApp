import {useMutation} from '@apollo/client';
import {useContext} from 'react';
import {LanguageContext} from '../context/LanguageContext';
import {CREATE_MISSED_LANGUAGE} from '../graphql/queries';
import {UNSAFE_RouteContext} from 'react-router-dom';

export function useLanguage() {
    const {language} = useContext(LanguageContext);
    const lastRouteContext = useContext(UNSAFE_RouteContext);
    const [createMissedLanguage] = useMutation(CREATE_MISSED_LANGUAGE, {
        onError: () => null,
        ignoreResults: true,
    });

    const translations = require('./' + language + '/index.json');

    let routeUrlPattern = window.location.pathname;
    lastRouteContext.matches?.forEach((value) => {
        if (value.pathname !== '/' && value.route.path) {
            routeUrlPattern = value.route.path;
        }
    });

    return (text: string, substitutes: object = {}) => {
        let translated = '';
        if (translations[text]) {
            // if value is stored as multiline html text as array in language json file. For example: homePagePart1 text
            if (Array.isArray(translations[text])) {
                translated = translations[text].join('\n');
            } else {
                translated = translations[text];
            }
        } else {
            translated = text;

            // don't send rus/ukr words, integer values
            if (
                language !== 'en' &&
                text &&
                text.match(/\w+/) &&
                text !== parseInt(text).toString()
            ) {
                createMissedLanguage({
                    variables: {
                        language: language,
                        text: text,
                        url: routeUrlPattern,
                    },
                });
            }
        }

        if (substitutes) {
            for (const [key, value] of Object.entries(substitutes)) {
                translated = translated.replace('{' + key + '}', value);
            }
        }

        return translated;
    };
}
