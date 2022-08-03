import { useContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGOUT } from '../../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import Loading from '../layoutParts/Loading';

export default function Logout() {
    const { setCurrentUser } = useContext(CurrentUserContext);

    const [logout] = useMutation(LOGOUT, {
        onError: () => {},
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function logoutHandler() {
            const responseData = await logout();
            if (responseData.data.logout) {
                localStorage.removeItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
                );
                setCurrentUser(null);

                navigate('/login', {
                    replace: true,
                });
            }
        }
        logoutHandler();
    }, []);

    return <Loading />;
}
