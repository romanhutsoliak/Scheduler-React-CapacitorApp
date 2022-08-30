export default function Toasts({ message }: { message?: string }) {
    return (
        <div
            className="toast"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="d-flex">
                <div className="toast-body">{message}</div>
                <button
                    type="button"
                    className="btn-close mt-2 me-2"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    onClick={(e) => {
                        const toastElement = (
                            e.target as HTMLTextAreaElement
                        ).closest('.toast');
                        if (toastElement)
                            toastElement.classList.remove('toastError', 'show');
                    }}
                ></button>
            </div>
        </div>
    );
}
