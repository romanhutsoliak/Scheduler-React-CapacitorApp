import { useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '../../context/CurrentUserContext';

export default function PrivateRoute() {
    const prevLocation = useLocation();
    const { currentUser } = useContext(CurrentUserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/401', {
                replace: true,
                state: { referer: prevLocation },
            });
        }
    });

    return <Outlet />;
}
