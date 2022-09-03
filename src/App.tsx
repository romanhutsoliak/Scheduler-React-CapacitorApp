import { useEffect, useState } from 'react';
import './assets/index.css';
import 'bootstrap/js/dist/dropdown.js';
import 'bootstrap/js/dist/collapse.js';
import 'bootstrap/js/dist/modal.js';
import MainRouter from './MainRouter';
import { CurrentUserContext, CurrentUserI } from './context/CurrentUserContext';
import {
    AVAILABLE_LANGUAGES,
    LanguageContext,
} from './context/LanguageContext';
import {
    CURRENT_USER,
    CREATE_USER_DEVICE,
    UPDATE_USER_TIMEZONE,
    CREATE_USER_FROM_DEVICE,
} from './graphql/queries';
import { useLazyQuery, useMutation } from '@apollo/client';
import Loading from './components/layoutParts/Loading';

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUserI | null>(null);
    const [language, setLanguage] = useState('en');
    const [loadingCurrentUser, setLoadingCurrentUser] = useState<boolean>(true);
    const [loadCurrentUser] = useLazyQuery(CURRENT_USER);
    const [createUserDevice] = useMutation(CREATE_USER_DEVICE, {
        onError: () => null,
    });
    const [createUserFromDevice] = useMutation(CREATE_USER_FROM_DEVICE, {
        onError: () => null,
    });
    const [updateUserTimezone] = useMutation(UPDATE_USER_TIMEZONE, {
        onError: () => null,
    });
    const userTimezoneOffset = new Date().getTimezoneOffset();

    useEffect(() => {
        const tokenLocalStorage = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        );
        if (tokenLocalStorage && !currentUser) {
            // declare the async data fetching function
            const fetchCurrentUser = async () => {
                await loadCurrentUser({
                    onCompleted: (data) => {
                        setCurrentUser(data.currentUser);
                        setLoadingCurrentUser(false);

                        if (data.currentUser) {
                            let timerIdCount = 0;
                            const timerId = setInterval(function () {
                                if (window.userDevice?.deviceId) {
                                    clearInterval(timerId);

                                    createUserDevice({
                                        variables: window.userDevice,
                                    });
                                }
                                if (timerIdCount >= 5) clearInterval(timerId);
                                timerIdCount++;
                            }, 2000);

                            if (
                                userTimezoneOffset !==
                                data.currentUser.timezoneOffset
                            ) {
                                updateUserTimezone({
                                    variables: {
                                        timezoneOffset: userTimezoneOffset,
                                    },
                                });
                            }
                        }
                    },
                    onError: (error) => {
                        localStorage.removeItem(
                            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
                        );
                        setLoadingCurrentUser(false);
                    },
                });
            };
            fetchCurrentUser().catch(console.error);
        }
        if (
            window.ReactNativeWebView &&
            loadingCurrentUser === false &&
            !currentUser
        ) {
            window.ReactNativeWebView?.postMessage('ReactNativeWebView');

            let timerIdCount = 0;
            const intervalId = setInterval(async () => {
                if (window.userDevice?.deviceId) {
                    clearInterval(intervalId);

                    await createUserFromDevice({
                        variables: {
                            ...window.userDevice,
                            timezoneOffset: userTimezoneOffset,
                        },
                        onCompleted: (data) => {
                            localStorage.setItem(
                                process.env.REACT_APP_LOCAL_STORAGE_PREFIX +
                                    'token',
                                data.createUserFromDevice.token
                            );
                            setCurrentUser(data.createUserFromDevice.user);
                            setLoadingCurrentUser(false);
                        },
                        onError: (error) => {
                            setLoadingCurrentUser(false);
                        },
                    });
                }
                if (timerIdCount >= 5) clearInterval(intervalId);
                timerIdCount++;
            }, 2000);
        } else {
            setLoadingCurrentUser(false);
        }

        // window.ReactNativeWebView?.postMessage(tokenLocalStorage);
        // localStorage.removeItem(
        //     process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        // );

        // autodetect device language
        const languageLocalStorage = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language'
        );
        if (languageLocalStorage) setLanguage(languageLocalStorage);
        else if (window.ReactNativeWebView) {
            let intervalIdCount = 0;
            const intervalId = setInterval(function () {
                if (window.userDevice?.locale) {
                    clearInterval(intervalId);
                    const locale = window.userDevice.locale.replace(
                        /\-.+$/,
                        ''
                    );
                    if (AVAILABLE_LANGUAGES.includes(locale)) {
                        localStorage.setItem(
                            process.env.REACT_APP_LOCAL_STORAGE_PREFIX +
                                'language',
                            locale
                        );
                        setLanguage(locale);
                    }
                }
                if (intervalIdCount >= 20) clearInterval(intervalId);
                intervalIdCount++;
            }, 300);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <CurrentUserContext.Provider
                value={{ currentUser, setCurrentUser }}
            >
                {loadingCurrentUser ? (
                    <Loading position="position-absolute" />
                ) : (
                    <MainRouter />
                )}
            </CurrentUserContext.Provider>
        </LanguageContext.Provider>
    );
}
