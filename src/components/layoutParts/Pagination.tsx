import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../languages';

type Props = {
    lastPage: number;
    currentPage: number;
    setCurrentPage: (pageNumber: number) => void;
};
export default function Pagination({
    lastPage,
    currentPage,
    setCurrentPage,
}: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const t = useLanguage();
    
    if (lastPage === 1) return null;
    const searchParamsPage = searchParams.get('page');
    if (searchParamsPage) {
        const searchParamsPageInt = parseInt(searchParamsPage);
        if (searchParamsPageInt && searchParamsPageInt !== currentPage)
            setCurrentPage(searchParamsPageInt);
    }

    const pageNumbers = [...Array.from(Array(lastPage + 1).keys())].slice(1);

    return (
        <nav className="paginationC">
            <ul className="pagination justify-content-center">
                {currentPage > 1 ? (
                    <li className="page-item">
                        <a
                            className="page-link"
                            onClick={(event) => {
                                event.preventDefault();
                                if (currentPage !== 1) {
                                    setCurrentPage(currentPage - 1);
                                    setSearchParams({
                                        page: (currentPage - 1).toString(),
                                    });
                                }
                            }}
                            href={'?page=' + (currentPage - 1)}
                        >
                            {t('PreviousPage')}
                        </a>
                    </li>
                ) : (
                    ''
                )}
                {pageNumbers.map((pageNumber) => (
                    <li
                        key={pageNumber}
                        className={`page-item ${
                            currentPage === pageNumber ? 'active' : ''
                        } `}
                    >
                        <a
                            onClick={(event) => {
                                event.preventDefault();
                                setCurrentPage(pageNumber);
                                setSearchParams({
                                    page: pageNumber.toString(),
                                });
                            }}
                            className="page-link"
                            href={'?page=' + pageNumber}
                        >
                            {pageNumber}
                        </a>
                    </li>
                ))}
                {currentPage < lastPage ? (
                    <li className="page-item">
                        <a
                            className="page-link"
                            onClick={(event) => {
                                event.preventDefault();
                                if (currentPage !== lastPage) {
                                    setCurrentPage(currentPage + 1);
                                    setSearchParams({
                                        page: (currentPage + 1).toString(),
                                    });
                                }
                            }}
                            href={'?page=' + (currentPage + 1)}
                        >
                            {t('NextPage')}
                        </a>
                    </li>
                ) : (
                    ''
                )}
            </ul>
        </nav>
    );
}
