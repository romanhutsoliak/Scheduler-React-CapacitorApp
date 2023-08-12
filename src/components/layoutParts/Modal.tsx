import React, { useState } from 'react';
import { useLanguage } from '../../languages';

type Props = {
    title?: String | undefined;
    okButtonText?: String | undefined;
    okButtonClass?: String | undefined;
    body?: React.ReactNode | undefined;
    onSuccessFn?: () => void;
};
export default function Modal({
    title,
    body,
    okButtonText,
    okButtonClass,
    onSuccessFn,
}: Props) {
    const [buttonLoading, setButtonLoading] = useState(false);
    const t = useLanguage();
    const onClickHandler = async () => {
        if (typeof onSuccessFn == 'function') {
            setButtonLoading(true);
            await onSuccessFn();

            // close
            const myModalClose = document.getElementById('myModalClose');
            if (myModalClose) {
                myModalClose.click();
            }
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
                    {body ? <div className="modal-body">{body}</div> : ''}
                    <div className="modal-footer">
                        <button
                            type="submit"
                            onClick={onClickHandler}
                            disabled={buttonLoading ? true : false}
                            className={
                                'btn ' +
                                (okButtonClass ? okButtonClass : 'btn-primary')
                            }
                        >
                            {buttonLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    &nbsp; {t('Processing')}...
                                </>
                            ) : (
                                <>{okButtonText ?? t('Ok')}</>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            {t('Close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
