import { useContext } from 'react';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../languages';

export default function Header() {
    const { currentUser } = useContext(CurrentUserContext);
    const navigate = useNavigate();
    const t = useLanguage();

    return (
        <nav className="navbar navbar-expand-lg topNavbar">
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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="currentColor"
                        className="bi bi-list headerMenuToggle"
                        viewBox="0 0 16 16"
                        focusable="false"
                    >
                        <path
                            fillRule="evenodd"
                            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                        />
                    </svg>
                </button>
                <div className="btn-group topUserMenuDropdown_cont">
                    <button
                        id="topUserMenuDropdown"
                        className="btn btn-link btn-link-topUser"
                        type="button"
                        onClick={(e) => {
                            let navigateTo = '/register';
                            if (currentUser) navigateTo = '/profile';
                            navigate(navigateTo);
                        }}
                    >
                        <span className="topUserMenuDropdown_span">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="30"
                                fill="currentColor"
                                className="bi bi-person-fill"
                                viewBox="0 0 16 16"
                                focusable="false"
                            >
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </svg>
                        </span>
                    </button>
                </div>
                <div
                    className="collapse navbar-collapse"
                    id="navbarTogglerDemo02"
                >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="/tasks"
                                data-bs-toggle="collapse"
                                data-bs-target=".navbar-collapse.show"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/tasks');
                                }}
                            >
                                {t('Tasks')}
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                aria-current="page"
                                href="/"
                                data-bs-toggle="collapse"
                                data-bs-target=".navbar-collapse.show"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/');
                                }}
                            >
                                {t('About')}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
