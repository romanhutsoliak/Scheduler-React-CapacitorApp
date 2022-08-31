import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    return (
        <>
            <h1>App introduction</h1>
            <p>
                This application will help you to memorize and do not skip
                important events which you perform periodically.
            </p>
            <p>To pay for services, taxes, ?????</p>
            <h2>Which is the difference from calendar ?</h2>
            <p>
                You see only days and events you have. All the information in
                one list. You don't need to search calendar to find your event
                walking by months.
            </p>
            <p>-----------------</p>
            <h2>Closest tasks</h2>
            <div className="loginOrRegister">
                <button
                    className="btn btn-primary"
                    title="Edit"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../tasks');
                    }}
                >
                    See my tasks
                </button>
            </div>
        </>
    );
}
