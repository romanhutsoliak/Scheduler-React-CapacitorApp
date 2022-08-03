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
    if (lastPage === 1) return null;

    const pageNumbers = [...Array.from(Array(lastPage + 1).keys())].slice(1);

    const nextPage = () => {
        if (currentPage !== lastPage) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage !== 1) setCurrentPage(currentPage - 1);
    };
    return (
        <nav>
            <ul className="pagination justify-content-center">
                {currentPage > 1 ? (
                    <li className="page-item">
                        <a className="page-link" onClick={prevPage} href="#">
                            Previous
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
                            onClick={() => setCurrentPage(pageNumber)}
                            className="page-link"
                            href="#"
                        >
                            {pageNumber}
                        </a>
                    </li>
                ))}
                {currentPage < lastPage ? (
                    <li className="page-item">
                        <a className="page-link" onClick={nextPage} href="#">
                            Next
                        </a>
                    </li>
                ) : (
                    ''
                )}
            </ul>
        </nav>
    );
}
