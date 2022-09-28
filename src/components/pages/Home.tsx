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
                        className="btn btn-primary"
                        title="Edit"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/tasks/create');
                        }}
                    >
                        <i className="bi bi-plus-circle"></i>{' '}
                        {t('Create your first task')}
                    </button>
                </div>
            ) : (
                ''
            )}
        </>
    );
}
