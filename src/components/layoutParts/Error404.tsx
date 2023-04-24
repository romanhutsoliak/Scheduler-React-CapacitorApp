

export default function Error404() {
    return (
        <div
            className="d-flex align-items-center justify-content-center h-100 w-100 mt-5 mb-5 position-relative"
        >
            <div className="loadingErrorCont">
                <h3 className="loadingErrorTitle" role="status">Page was not found</h3>
                <p className="loadingErrorBody" role="status">We can't find a page you are looking for</p>
            </div>
        </div>
    );
}
