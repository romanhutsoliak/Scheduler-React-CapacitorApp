import image from './../../assets/images/no-internet-connection.png';
export default function LoadingError() {
    // timeout is 150 because index.tsx has create toast with timeout 100
    window.setTimeout(function () {
        const toastCont = document.querySelector<HTMLElement>('.toast');
        toastCont?.classList.remove('toastError', 'show');
    }, 100);

    return (
        <div
            className="d-flex align-items-center justify-content-center text-center h-100 w-100 mt-5 mb-5 position-relative"
        >
            <div className="loadingErrorCont">
                <img src={image} alt="" />
                <br />
                <br />
                <h3 className="loadingErrorTitle" role="status">No connection</h3>
                <p className="loadingErrorBody" role="status">Please check your internet connection and try again</p>
            </div>
        </div>
    );
}
