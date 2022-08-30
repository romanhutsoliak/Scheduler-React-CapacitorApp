import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/index.css';
import 'bootstrap/js/dist/dropdown.js';
import 'bootstrap/js/dist/collapse.js';
import 'bootstrap/js/dist/modal.js';
import MainRouter from './MainRouter';
import { CurrentUserContext, CurrentUserI } from './context/CurrentUserContext';
import { CURRENT_USER, CREATE_USER_DEVICE } from './graphql/queries';
import { useLazyQuery, useMutation } from '@apollo/client';
import Loading from './components/layoutParts/Loading';

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUserI | null>(null);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState<boolean>(true);
    const [loadCurrentUser] = useLazyQuery(CURRENT_USER);
    const [createUserDevice] = useMutation(CREATE_USER_DEVICE, {
        onError: () => null,
    });

    useEffect(() => {
        const token = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
        );
        if (token) {
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
                                        variables: {
                                            deviceId:
                                                window.userDevice.deviceId,
                                            platform:
                                                window.userDevice.platform,
                                            manufacturer:
                                                window.userDevice.manufacturer,
                                            model: window.userDevice.model,
                                            appVersion:
                                                window.userDevice.appVersion,
                                            notificationToken:
                                                window.userDevice
                                                    .notificationToken,
                                        },
                                    });
                                }
                                if (timerIdCount >= 10) clearInterval(timerId);
                                timerIdCount++;
                            }, 2000);
                        }
                    },
                    onError: (error) => {
                        setLoadingCurrentUser(false);
                    },
                });
            };
            fetchCurrentUser().catch(console.error);
        } else {
            setLoadingCurrentUser(false);
        }
    }, []);

    return (
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
            {loadingCurrentUser ? (
                <Loading position="position-absolute" />
            ) : (
                <MainRouter />
            )}
        </CurrentUserContext.Provider>
    );
}
