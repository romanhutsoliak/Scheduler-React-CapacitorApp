import image from '../../assets/images/no-internet-connection.png';

export default function Error401() {
    return (
        <div
            className="d-flex align-items-center justify-content-center h-100 w-100 mt-5 mb-5 position-relative"
        >
            <div className="loadingErrorCont">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="72"
                         height="72"
                         fill="currentColor"
                         className="bi bi-exclamation-triangle"
                         viewBox="0 0 16 16"
                         focusable="false"
                         style={{color: "#dc3545"}}
                    >
                        <path
                            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path
                            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                </div>
                <br/>
                <h3 className="text-center loadingErrorTitle" role="status">Unauthorized</h3>
                <p className="loadingErrorBody" role="status">We can't authenticate this device.</p>
            </div>
        </div>
    );
}
