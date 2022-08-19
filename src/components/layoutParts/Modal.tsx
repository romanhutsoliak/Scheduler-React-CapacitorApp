import React, { useState } from 'react';

type Props = {
    title?: String | undefined;
    okButtonText?: String | undefined;
    body: React.ReactNode;
    onSuccessFn?: () => void;
};
export default function Modal({
    title,
    body,
    okButtonText,
    onSuccessFn,
}: Props) {
    const [buttonLoading, setButtonLoading] = useState(false);
    const onClickHandler = async () => {
        if (typeof onSuccessFn == 'function') {
            setButtonLoading(true);
            await onSuccessFn();

            // close
            const myModalClose = document.getElementById('myModalClose');
            if (myModalClose) myModalClose.click();
            setButtonLoading(false);
        }
    };
    return (
        <div
            className="modal fade"
            id="globalModal"
            tabIndex={-1}
            aria-labelledby="globalModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="modal-title" id="globalModalLabel">
                            {title ?? 'Modal'}
                        </div>
                        <button
                            id="myModalClose"
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">{body}</div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onClickHandler}
                            disabled={buttonLoading ? true : false}
                        >
                            {buttonLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    &nbsp; Processing...
                                </>
                            ) : (
                                <>{okButtonText ?? 'Ok'}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
