import { useEffect, useRef, useState } from 'react';
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

// webViewRef.current.injectJavaScript() it watches in App.tsx
type UserDeviceType = {
    deviceId?: string;
    platform?: string;
    manufacturer?: string;
    model?: string;
    appVersion?: string;
    notificationToken?: string;
    locale?: string;
    updated_at?: string;
};

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUserI | null>(null);
    const [language, setLanguage] = useState('en');
    const userDevice = useRef<UserDeviceType | null>(null);
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
        if (message.detail.action === 'userDevice') {
            userDevice.current = userDevice.current
                ? {
                      ...userDevice.current,
                      ...message.detail.data,
                  }
                : message.detail.data;

            if (message.detail.data.locale) {
                const locale = message.detail.data.locale.replace(/\-.+$/, '');
                if (AVAILABLE_LANGUAGES.includes(locale)) {
                    localStorage.setItem(
                        process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language',
                        locale
                    );
                    setLanguage(locale);
                }
            }
        }
        if (message.detail.action === 'notificationToken') {
            userDevice.current = {
                ...userDevice.current,
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
        clog(window.isNativeApp ? 'isNativeApp' : 'not isNativeApp');
        if (
            window.isNativeApp &&
            !currentUser &&
            (!tokenLocalStorage || !loadingCurrentUser)
        ) {
            window.ReactNativeWebView?.postMessage('ReactNativeWebView');

            let timerIdCount = 0;
            const intervalId = setInterval(async () => {
                if (userDevice.current?.deviceId) {
                    clearInterval(intervalId);

                    await createUserFromDevice({
                        variables: {
                            ...userDevice.current,
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
                if (timerIdCount >= 10) clearInterval(intervalId);
                timerIdCount++;
            }, 1000);
            if (timerIdCount >= 5) {
                setLoadingCurrentUser(false);
            }
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
                    userDevice.current &&
                    userDevice.current.deviceId
                ) {
                    createUserDevice({
                        variables: userDevice.current,
                        onCompleted(data) {
                            userDevice.current =
                                data.createUserDevice as UserDeviceType;
                        },
                    });
                }
            }, 5000);
            if (
                typeof currentUser.timezoneOffset != undefined &&
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
            <div id="mess"></div>
        </LanguageContext.Provider>
    );
}

// console log for the app
function clog(message: any) {
    if (typeof message !== 'string') message = JSON.stringify(message);
    const node = document.createElement('div');
    const textNode = document.createTextNode('--- ' + message);
    node.appendChild(textNode);
    let clog = document.getElementById('clog');
    if (!clog) {
        const newClog = document.createElement('div');
        newClog.setAttribute('id', 'clog');
        document.getElementById('root')?.after(newClog);
        clog = document.getElementById('clog');
    }
    clog?.appendChild(node);
}
