import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/dropdown.js';
import MainRouter from './MainRouter';
import { CurrentUserContext, CurrentUserI } from './context/CurrentUserContext';
import { CURRENT_USER } from './graphql/queries';
import { useLazyQuery } from '@apollo/client';
import Loading from './components/layoutParts/Loading';

export default function App() {
    const [currentUser, setCurrentUser] = useState<CurrentUserI | null>(null);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState<boolean>(true);
    const [loadCurrentUser] = useLazyQuery(CURRENT_USER);

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
