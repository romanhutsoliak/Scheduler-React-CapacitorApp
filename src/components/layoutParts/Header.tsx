import { useContext } from 'react';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { currentUser } = useContext(CurrentUserContext);
    const navigate = useNavigate();
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container container-fluid">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarTogglerDemo02"
                    aria-controls="navbarTogglerDemo02"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="btn-group topUserMenuDropdown_cont">
                    <button
                        className="btn btn-link btn-link-topUser dropdown-toggle"
                        type="button"
                        id="topUserMenuDropdown"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="true"
                        aria-expanded="false"
                    >
                        <span>
                            <i className="bi bi-person-fill"></i>&nbsp;
                            {currentUser ? currentUser.name : 'Guest'}
                        </span>
                    </button>
                    <ul
                        className="dropdown-menu"
                        aria-labelledby="topUserMenuDropdown"
                    >
                        {currentUser ? (
                            <>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/profile"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('../profile');
                                        }}
                                    >
                                        Profile
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/logout"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('../logout');
                                        }}
                                    >
                                        Logout
                                    </a>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/login"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('../login');
                                        }}
                                    >
                                        Login
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/register"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('../register');
                                        }}
                                    >
                                        Registration
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
                <div
                    className="collapse navbar-collapse"
                    id="navbarTogglerDemo02"
                >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                aria-current="page"
                                href="/"
                                data-bs-toggle="collapse"
                                data-bs-target=".navbar-collapse.show"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('../');
                                }}
                            >
                                Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="/tasks"
                                data-bs-toggle="collapse"
                                data-bs-target=".navbar-collapse.show"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('../tasks');
                                }}
                            >
                                Tasks
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
