import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CurrentUserContext } from '../../context/CurrentUserContext';

export default function PrivateRoute() {
    const prevLocation = useLocation();
    const { currentUser } = useContext(CurrentUserContext); // determine if authorized, from context or however you're doing it

    return currentUser ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ referer: prevLocation }} />
    );
}
