import { useContext, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { LOGOUT } from '../../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import Loading from '../layoutParts/Loading';
import { UserDeviceContext } from 'src/context/UserDeviceContext';

export default function Logout() {
    const { setCurrentUser } = useContext(CurrentUserContext);
    const { userDevice } = useContext(UserDeviceContext);
    const logoutLoading = useRef(false);
    const navigate = useNavigate();

    const [logout] = useMutation(LOGOUT, {
        onError: () => {},
        onCompleted: (data) => {
            if (data?.logout) {
                localStorage.removeItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
                );
                localStorage.removeItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'userHasTasks'
                );
                setCurrentUser(null);
                logoutLoading.current = false;
                navigate('/login', {
                    replace: true,
                });
            }
        },
    });

    useEffect(() => {
        if (!logoutLoading.current) {
            logout({
                variables: {
                    deviceId: userDevice?.deviceId ?? null,
                },
            });
            logoutLoading.current = true;
        }
    }, []);

    return <Loading />;
}
