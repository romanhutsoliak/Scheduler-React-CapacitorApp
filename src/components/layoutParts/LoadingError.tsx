
export default function LoadingError() {
    // timeout is 150 because index.tsx has to create toast with timeout 100
    window.setTimeout(function () {
        const toastCont = document.querySelector<HTMLElement>('.toast');
        toastCont?.classList.remove('toastError', 'show');
    }, 100);

    return (
        <div
            className="d-flex align-items-center justify-content-center text-center h-100 w-100 mt-5 mb-5 position-relative"
        >
            <div className="loadingErrorCont">
                <div className="text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="72"
                        height="72"
                        fill="currentColor"
                        className="bi bi-emoji-frown"
                        viewBox="0 0 16 16"
                        focusable="false"
                    >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path
                            d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.5 3.5 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.5 4.5 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
                    </svg>
                </div>
                <br/>
                <h3 className="text-center loadingErrorTitle" role="status">No connection</h3>
                <p className="loadingErrorBody" role="status">Please check your internet connection and try again</p>
                <button
                    id="mainPageCreateANewTask"
                    className="btn btn-primary"
                    title="Edit"
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.reload();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-arrow-clockwise"
                        viewBox="0 0 16 16"
                        focusable="false"
                    >
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                        <path
                            d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                    </svg>
                    {' '}
                    Try again
                </button>
            </div>
        </div>
    );
}
