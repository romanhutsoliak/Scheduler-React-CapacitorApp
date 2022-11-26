import { useLanguage } from '../../languages';

export default function Footer() {
    const t = useLanguage();
    return (
        <div className="mini-footer footer mt-auto py-3 bg-light">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="copyright-text">
                            <p>{t('The important should be done')} :)</p>
                        </div>

                        <div className="go_top">
                            <span className="icon-arrow-up"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
