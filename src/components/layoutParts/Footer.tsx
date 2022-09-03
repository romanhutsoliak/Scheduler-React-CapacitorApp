import { useLanguage } from '../../languages';

export default function Footer() {
    const t = useLanguage();
    return (
        <div className="mini-footer">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="copyright-text">
                            <p>
                                © 2022.{' '}
                                {t('All rights reserved. Created by Roman')} :)
                            </p>
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
