import {useEffect, useRef, useState} from 'react';
import './assets/css/bootstrap.min.css';
import './assets/css/index.css';
import 'bootstrap/js/dist/dropdown.js';
import 'bootstrap/js/dist/collapse.js';
import 'bootstrap/js/dist/modal.js';
import MainRouter from './MainRouter';
import {CurrentUserContext, CurrentUserI} from './context/CurrentUserContext';
import {AVAILABLE_LANGUAGES, LanguageContext,} from './context/LanguageContext';
import {CREATE_USER_DEVICE, CREATE_USER_FROM_DEVICE, CURRENT_USER, UPDATE_USER_TIMEZONE,} from './graphql/queries';
import {useLazyQuery, useMutation} from '@apollo/client';
import {UserDeviceContext, UserDeviceType} from './context/UserDeviceContext';
import {Capacitor} from '@capacitor/core';
import {Device} from '@capacitor/device';
import {App as CapacitorApp} from '@capacitor/app';
import {PushNotifications, Token} from '@capacitor/push-notifications';
import LoadingError from './components/layoutParts/LoadingError';
import { SplashScreen } from '@capacitor/splash-screen';

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUserI | null>(null);
    const [userDevice, setUserDevice] = useState<UserDeviceType | null>(null);
    const [language, setLanguage] = useState('en');
    const [noConnection, setNoConnection] = useState(false);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState<boolean>(true);
    const [loadCurrentUser] = useLazyQuery(CURRENT_USER, {
        onError: () => setNoConnection(true),
    });
    const [createUserDevice] = useMutation(CREATE_USER_DEVICE, {
        onError: () => setNoConnection(true),
    });
    const [createUserFromDevice] = useMutation(CREATE_USER_FROM_DEVICE, {
        onError: () => setNoConnection(true),
    });
    const [updateUserTimezone] = useMutation(UPDATE_USER_TIMEZONE, {
        onError: () => setNoConnection(true),
    });
    const userTimezoneOffset = new Date().getTimezoneOffset();
    const isNativeApp = Capacitor.isPluginAvailable('PushNotifications');
    const authenticatedByUserDeviceFailed = useRef(false);

    // the first
    useEffect(() => {
        if (isNativeApp) {
            const splashScreenHide = async () => {
                await SplashScreen.hide();
            };
            splashScreenHide();

            // User device
            const setUserDeviceInfo = async () => {
                const deviceInfo = await Device.getInfo();
                const deviceId = await Device.getId();
                const localeCode = await Device.getLanguageCode();
                const capacitorApp = await CapacitorApp.getInfo();
                setUserDevice(prevUserDevice => ({
                    ...prevUserDevice,
                    deviceId: deviceId?.identifier,
                    platform: deviceInfo?.platform + ' ' + deviceInfo?.osVersion,
                    manufacturer: deviceInfo?.manufacturer,
                    model: deviceInfo?.name,
                    locale: localeCode?.value,
                    appVersion: capacitorApp?.version,
                }));
            };
            setUserDeviceInfo();

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', (token: Token) => {
                setUserDevice(prevUserDevice => ({
                    ...prevUserDevice,
                    notificationToken: token.value,
                }));
            });
        }

        let tokenLocalStorage = localStorage.getItem(
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
                            tokenLocalStorage = null;
                        }
                    },
                    onError: () => {
                        setNoConnection(true)
                        setLoadingCurrentUser(false);
                    },
                });
            };
            fetchCurrentUser();
        }
        if (!tokenLocalStorage && !currentUser && isNativeApp) {
            createUserFromDeviceFn();
            authenticatedByUserDeviceFailed.current = true;
            // next try is down below useEffect(() => {}, [userDevice?.deviceId]);
        }
        if (!tokenLocalStorage && !isNativeApp) {
            setLoadingCurrentUser(false);
        }

        // Reset token for app testing
        // localStorage.removeItem(
        //     process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        // );

        // autodetect device language
        const languageLocalStorage = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language'
        );
        if (languageLocalStorage) {
            setLanguage(languageLocalStorage);
        }
        else if (userDevice?.locale) {
            const locale = userDevice?.locale.replace(/-.+$/, '');
            if (AVAILABLE_LANGUAGES.includes(locale)) {
                localStorage.setItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language',
                    locale
                );
                setLanguage(locale);
            }
        }

        return () => {

        };
    }, []);

    // after login, register, tokenAutoLogin action
    useEffect(() => {
        if (currentUser) {
            window.setTimeout(function () {
                if (userDevice?.deviceId) {
                    createUserDevice({
                        variables: userDevice,
                    });
                }
            }, 3000);
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

    const createUserFromDeviceFn = async () => {
        if (
            !currentUser &&
            userDevice?.deviceId
        ) {
            await createUserFromDevice({
                variables: {
                    deviceId: userDevice?.deviceId,
                    manufacturer: userDevice?.manufacturer,
                    model: userDevice?.model,
                    timezoneOffset: userTimezoneOffset
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
                onError: () => {
                    setNoConnection(true);
                    setLoadingCurrentUser(false);
                },
            });
        }
    };
    // after userDevice object is ready and was not authenticated with stored token in the first useEffect()
    useEffect(() => {
        if (authenticatedByUserDeviceFailed.current) {
            createUserFromDeviceFn();
        }
    }, [userDevice?.deviceId]);

    if (noConnection) {
        return <LoadingError/>;
    }

    return (
        <>
            <UserDeviceContext.Provider value={{userDevice, setUserDevice}}>
                <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                    <LanguageContext.Provider value={{language, setLanguage}}>
                        <MainRouter loadingCurrentUser={loadingCurrentUser}/>
                    </LanguageContext.Provider>
                </CurrentUserContext.Provider>
            </UserDeviceContext.Provider>
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
