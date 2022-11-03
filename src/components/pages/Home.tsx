import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../languages';

export default function Home() {
    const navigate = useNavigate();
    const t = useLanguage();
    const userHasTasksLocalStorage = localStorage.getItem(
        process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'userHasTasks'
    );

    useEffect(() => {
        if (
            window.appStartTimestamp &&
            Date.now() - window.appStartTimestamp < 2000 &&
            userHasTasksLocalStorage &&
            userHasTasksLocalStorage === 'true'
        ) {
            navigate('/tasks');
        }
    }, []);

    return (
        <>
            <h1>{t('App introduction')}</h1>
            <p>
                This application will help you to memorize and do not skip
                important events which you perform periodically.
            </p>
            <ul>
                <li>To pay for services</li>
                <li>Taxes</li>
                <li>Visits to a dentist</li>
                <li>ets ...</li>
            </ul>
            <h2>Which is the difference from calendar ?</h2>
            <p>
                You see only days and events you have. All the information in
                one list. You don't need to search calendar to find your event
                walking by months.
            </p>
            {!userHasTasksLocalStorage ||
            userHasTasksLocalStorage !== 'true' ? (
                <div className="mainPageLoginOrRegister">
                    <button
                        id="mainPageCreateANewTask"
                        className="btn btn-primary"
                        title="Edit"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/tasks/create');
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-plus-circle"
                            viewBox="0 0 16 16"
                            focusable="false"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>{' '}
                        {t('Create your first task')}
                    </button>
                </div>
            ) : (
                ''
            )}
        </>
    );
}
