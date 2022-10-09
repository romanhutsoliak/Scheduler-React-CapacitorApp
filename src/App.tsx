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

    const handleMessageFromReactNative = (message: CustomEvent) => {
        if (message.detail.action === 'notificationToken') {
            window.userDevice = {
                ...window.userDevice,
                notificationToken: message.detail.data as string,
            };
        }
    };

    // the first
    useEffect(() => {
        window.addEventListener(
            'message_from_react_native',
            handleMessageFromReactNative as EventListener
        );

        const tokenLocalStorage = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        );
        if (tokenLocalStorage && !currentUser) {
            const fetchCurrentUser = async () => {
                await loadCurrentUser({
                    onCompleted: (data) => {
                        setCurrentUser(data.currentUser);
                        setLoadingCurrentUser(false);
                        if (data.currentUser === null) {
                            localStorage.removeItem(
                                process.env.REACT_APP_LOCAL_STORAGE_PREFIX +
                                    'token'
                            );
                        }
                    },
                    onError: (error) => {
                        setLoadingCurrentUser(false);
                    },
                });
            };
            fetchCurrentUser().catch((error) => {
                window.ReactNativeWebView?.postMessage(error);
            });
        }
        if (
            window.userDevice?.deviceId &&
            !currentUser &&
            (!tokenLocalStorage || loadingCurrentUser === false)
        ) {
            // clog('window.userDevice?.deviceId');
            const fetchCreateUserFromDevice = async () => {
                await createUserFromDevice({
                    variables: {
                        deviceId: window.userDevice?.deviceId,
                        timezoneOffset: userTimezoneOffset,
                    },
                    onCompleted: (data) => {
                        if (data.createUserFromDevice.token) {
                            localStorage.setItem(
                                process.env.REACT_APP_LOCAL_STORAGE_PREFIX +
                                    'token',
                                data.createUserFromDevice.token
                            );
                            setCurrentUser(data.createUserFromDevice.user);
                        }
                        setLoadingCurrentUser(false);
                    },
                    onError: (error) => {
                        setLoadingCurrentUser(false);
                    },
                });
            };
            fetchCreateUserFromDevice().catch((error) => {
                window.ReactNativeWebView?.postMessage(error);
            });
        }
        if (!tokenLocalStorage && !window.isNativeApp) {
            setLoadingCurrentUser(false);
        }

        // Reset token for app testing
        // window.ReactNativeWebView?.postMessage(tokenLocalStorage);
        // localStorage.removeItem(
        //     process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        // );

        // autodetect device language
        const languageLocalStorage = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language'
        );
        if (languageLocalStorage) setLanguage(languageLocalStorage);
        else if (window.userDevice?.locale) {
            const locale = window.userDevice?.locale.replace(/-.+$/, '');
            if (AVAILABLE_LANGUAGES.includes(locale)) {
                localStorage.setItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language',
                    locale
                );
                setLanguage(locale);
            }
        }

        return () => {
            window.removeEventListener(
                'message_from_react_native',
                handleMessageFromReactNative as EventListener
            );
        };
    }, []);

    // after login, register, tokenAutoLogin action
    useEffect(() => {
        if (currentUser) {
            window.setTimeout(function () {
                if (
                    window.isNativeApp &&
                    window.userDevice &&
                    window.userDevice.deviceId
                ) {
                    createUserDevice({
                        variables: window.userDevice,
                        onCompleted(data) {
                            window.userDevice = data.createUserDevice;
                        },
                    });
                }
            }, 5000);
            if (
                typeof currentUser.timezoneOffset !== undefined &&
                userTimezoneOffset !== currentUser.timezoneOffset
            ) {
                updateUserTimezone({
                    variables: {
                        timezoneOffset: userTimezoneOffset,
                    },
                });
            }
        }
    }, [currentUser]);

    return (
        <>
            <CurrentUserContext.Provider
                value={{ currentUser, setCurrentUser }}
            >
                <LanguageContext.Provider value={{ language, setLanguage }}>
                    {loadingCurrentUser ? (
                        <Loading position="position-absolute" />
                    ) : (
                        <MainRouter />
                    )}
                </LanguageContext.Provider>
            </CurrentUserContext.Provider>
            <div id="mess"></div>
        </>
    );
}

// console log for the app
// function clog(message: any) {
//     if (typeof message !== 'string') message = JSON.stringify(message);
//     const node = document.createElement('div');
//     const textNode = document.createTextNode('--- ' + message);
//     node.appendChild(textNode);
//     let clog = document.getElementById('clog');
//     if (!clog) {
//         const newClog = document.createElement('div');
//         newClog.setAttribute('id', 'clog');
//         document.getElementById('root')?.after(newClog);
//         clog = document.getElementById('clog');
//     }
//     clog?.appendChild(node);
// }
