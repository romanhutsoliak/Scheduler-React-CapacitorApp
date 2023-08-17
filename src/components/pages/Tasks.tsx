import {useEffect, useRef, useState} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {COMPLETE_TASK, GET_TASKS, TASK_CATEGORIES_WITH_TASKS} from '../../graphql/queries';
import Loading from '../layoutParts/Loading';
import Pagination from '../layoutParts/Pagination';
import Modal from '../layoutParts/Modal';
import {DateFormateUtils, TimeToEventUtils} from '../../utils';
import {useLanguage} from '../../languages';
import LoadingError from '../layoutParts/LoadingError';

type GetTaskResponseType = {
    id?: number;
    name: string;
    nextRunDateTime: string;
    isActive: boolean;
};

type TaskCategoryType = {
    id?: number;
    name: string;
    slug: string;
    label: boolean;
};

export default function Tasks() {
    const [searchParams] = useSearchParams();
    const searchParamsPage = searchParams.get('page');
    const [currentPage, setCurrentPage] = useState(
        searchParamsPage ? parseInt(searchParamsPage) : 1
    );
    const [recordsPerPage] = useState(10); // , setRecordsPerPage
    const completeTaskId = useRef<number | undefined>();
    const completeNotesRef = useRef<HTMLTextAreaElement>(null);
    const searchBarTimeoutId = useRef<NodeJS.Timeout>();
    const searchBarRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const t = useLanguage();
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showFiltersBar, setShowFiltersBar] = useState(false);
    const [searchBarValue, setSearchBarValue] = useState('');
    const [filterBarCategoryValue, setFilterBarCategoryValue] = useState('');

    const [completeTask] = useMutation(COMPLETE_TASK, {
        onError: () => null,
        onCompleted: () => {
            loadTasks();
        },
    });
    const userHasTasksLocalStorage = localStorage.getItem(
        process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'userHasTasks'
    );
    const [loadTasks, {loading, error, data}] = useLazyQuery(GET_TASKS, {
        variables: {
            search: searchBarValue, // || null,
            filter: {
                category: filterBarCategoryValue
            },
            recordsPerPage,
            currentPage,
        },
        onCompleted: (data) => {
            // show add button at once, don't wait for scroll
            window.setInterval(() => scrollEventHandler(), 50);

            if (userHasTasksLocalStorage !== 'true' && data.tasks.data) {
                localStorage.setItem(
                    process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'userHasTasks',
                    data.tasks.data.length ? 'true' : 'false'
                );
            }

            if (!taskCategories.length) {
                loadTaskCategories();
            }
        },
    });
    const [loadTaskCategories] = useLazyQuery(TASK_CATEGORIES_WITH_TASKS, {
        onCompleted: (data) => {
            setTaskCategories(data.taskCategoriesWithTasks);
        },
    });
    const [taskCategories, setTaskCategories] = useState<TaskCategoryType[]>([]);

    // add new task (+) fixed button
    const scrollEventHandler = () => {
        const taskButtonC = document.getElementsByClassName(
            'addTaskButtonC'
        )[0] as HTMLElement | null;
        // for mobile devices only
        if (taskButtonC && window.innerWidth < 992) {
            if (
                taskButtonC.offsetTop > window.innerHeight
                && window.scrollY + window.innerHeight < taskButtonC.offsetTop
            ) {
                taskButtonC.classList.add('addTaskButtonCFixed');
            } else {
                taskButtonC.classList.remove('addTaskButtonCFixed');
            }
        }
    };

    let touchY: number = 0;
    const touchstartEventHandler = (e: TouchEvent) => {
        touchY = e.changedTouches[0].clientY ?? 0;
    };
    const touchendEventHandler = (e: TouchEvent) => {
        if (
            touchY > 0
            && e.changedTouches[0].clientY > 0
            && window.scrollY === 0
            && touchY < e.changedTouches[0].clientY
            && e.changedTouches[0].clientY - touchY > 150
        ) {
            loadTasks();
        }
    };

    useEffect(() => {
        // add button
        document.addEventListener('scroll', scrollEventHandler);
        // reload data after slide down
        document.addEventListener('touchstart', touchstartEventHandler);
        document.addEventListener('touchend', touchendEventHandler);

        loadTasks();

        return () => {
            document.removeEventListener('scroll', scrollEventHandler);
            document.addEventListener('touchstart', touchstartEventHandler);
            document.addEventListener('touchend', touchendEventHandler);
        };
    }, []);

    useEffect(() => {
        loadTasks();
    }, [searchBarValue, filterBarCategoryValue]);

    const onClickDetailHandler = (
        event: React.MouseEvent<HTMLElement>,
        id: number | undefined
    ) => {
        event.preventDefault();
        navigate('../tasks/' + id);
    };

    if (error) {
        return <LoadingError/>;
    }

    return (
        <>
            <div className="tasts-h1-cont d-flex align-items-center highlight-toolbar pe-2 py-1">
                <h1>{t('Tasks')}</h1>

                <div className="d-flex ms-auto">
                    <button
                        type="button" className="btn-edit text-nowrap" aria-label="Search task"
                        data-bs-original-title="Search task"
                        onClick={() => {
                            if (!showSearchBar) {
                                setShowSearchBar(true);
                                if (showFiltersBar) {
                                    setShowFiltersBar(false);
                                }
                            } else {
                                setShowSearchBar(false);
                                setSearchBarValue('');
                            }
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-search" viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                    <button
                        type="button" className="btn-clipboard mt-0 me-0" aria-label="Filter task"
                        data-bs-original-title="Filter task"
                        onClick={() => {
                            if (!showFiltersBar) {
                                setShowFiltersBar(true);
                                if (showSearchBar) {
                                    setShowSearchBar(false);
                                    setSearchBarValue('');
                                }
                            } else {
                                setShowFiltersBar(false);
                            }
                        }}
                    >
                        {filterBarCategoryValue ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-filter-square-fill" viewBox="0 0 16 16">
                                <path
                                    d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm.5 5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1 0-1zM4 8.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm2 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-filter" viewBox="0 0 16 16">
                                <path
                                    d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {showSearchBar && (
                <div className="input-group input-group-md mb-3">
                    <input
                        ref={searchBarRef}
                        type="text" className="form-control" placeholder="Search your task"
                        aria-describedby="searchBar-input-group-text"
                        onChange={(e) => {
                            if (searchBarTimeoutId.current) {
                                clearTimeout(searchBarTimeoutId.current);
                            }
                            searchBarTimeoutId.current = setTimeout(function () {
                                if (!e.target.value.length || e.target.value.length > 2) {
                                    setSearchBarValue(e.target.value);
                                }
                            }, 1000);
                        }}
                    />
                    {searchBarValue.length > 0 && (
                        <span
                            className="input-group-text" id="searchBar-input-group-text" role="button"
                            onClick={() => {
                                if (searchBarRef.current) {
                                    searchBarRef.current.value = '';
                                    setSearchBarValue('');
                                }
                            }}
                        >&times;</span>
                    )}
                </div>
            )}
            {showFiltersBar && (
                <div className="input-group input-group-md mb-3">
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={(e) => {
                            setFilterBarCategoryValue(e.target.value);
                        }}
                        value={filterBarCategoryValue}
                    >
                        <option value="" selected>All categories</option>
                        {taskCategories.map((category) => {
                            return <option value={category.slug}>{category.name || 'No category'}</option>
                        })}
                    </select>
                </div>
            )}

            {loading
                ? <Loading/>
                : (data?.tasks?.data?.length ? (
                        <div className="table-responsive tasksTableCont">
                            <table className="table table-responsive">
                                <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">{t('TaskName')}</th>
                                    <th scope="col">{t('Next run time')}</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.tasks.data.map(
                                    (
                                        {
                                            id,
                                            name,
                                            nextRunDateTime,
                                            isActive,
                                        }: GetTaskResponseType,
                                        index: number
                                    ) => (
                                        <tr
                                            key={id}
                                            className={
                                                (isActive
                                                    ? ''
                                                    : 'tasksIsNotActive ') +
                                                'taskViewListDiv'
                                            }
                                        >
                                            <td className="tasksTableN">
                                                {index + 1}
                                            </td>
                                            <td
                                                className="tasksTableName"
                                                onClick={(event) =>
                                                    onClickDetailHandler(event, id)
                                                }
                                            >
                                                {name}
                                            </td>
                                            <td
                                                className={
                                                    'tasksTableNextDate ' +
                                                    (Date.parse(nextRunDateTime) <
                                                    Date.now()
                                                        ? 'tasksTableNextDate_passed'
                                                        : '')
                                                }
                                                onClick={(event) =>
                                                    onClickDetailHandler(event, id)
                                                }
                                            >
                                                {DateFormateUtils(
                                                    nextRunDateTime,
                                                    false
                                                )}{' '}
                                                <br className="d-block d-sm-none"/>
                                                (
                                                {TimeToEventUtils(
                                                    nextRunDateTime,
                                                    t
                                                )}
                                                )
                                            </td>
                                            <td className="text-lg-end tasksTableActions">
                                                <a
                                                    className="btn btn-link"
                                                    title={t('Details')}
                                                    href={'/tasks/' + id}
                                                    onClick={(event) =>
                                                        onClickDetailHandler(
                                                            event,
                                                            id
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-eye"
                                                        viewBox="0 0 16 16"
                                                        focusable="false"
                                                    >
                                                        <path
                                                            d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                        <path
                                                            d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                                    </svg>
                                                </a>
                                                {isActive ? (
                                                    <button
                                                        className="btn btn-link"
                                                        title={t('Complete')}
                                                        type="button"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#globalModal"
                                                        onClick={() => {
                                                            completeTaskId.current =
                                                                id;
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-check-circle"
                                                            viewBox="0 0 16 16"
                                                            focusable="false"
                                                        >
                                                            <path
                                                                d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                            <path
                                                                d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    ''
                                                )}
                                                <a
                                                    className="btn btn-link"
                                                    title={t('Edit')}
                                                    href={'/tasks/' + id + '/edit'}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(
                                                            '../tasks/' +
                                                            id +
                                                            '/edit'
                                                        );
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-pencil-fill"
                                                        viewBox="0 0 16 16"
                                                        focusable="false"
                                                    >
                                                        <path
                                                            d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                                    </svg>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mb-4" dangerouslySetInnerHTML={{
                            __html: t(searchBarValue.length > 0
                                ? 'Nothing found for your request'
                                : 'TasksListEmpty')
                        }}/>
                    )
                )}

            {!loading && (
                <>
                    {data?.tasks?.paginatorInfo && (
                        <Pagination
                            lastPage={data.tasks.paginatorInfo.lastPage}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    )}

                    <div className="addTaskButtonC">
                        <button
                            type="button"
                            className="btn btn-primary addTaskButton"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('../tasks/create');
                            }}
                            title={t('Create a new task')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-plus-circle"
                                viewBox="0 0 16 16"
                                focusable="false"
                            >
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path
                                    d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            <span className="addTaskButtonSpan">
                                {' '} {t('Create a new task')}
                            </span>
                        </button>
                    </div>
                </>
            )}

            <Modal
                title={t('Do you want to complete the task ?')}
                body={
                    <>
                        <div className="mb-3">
                            <textarea
                                ref={completeNotesRef}
                                className="form-control"
                                rows={3}
                                placeholder={t('Complete notes (optional)')}
                            ></textarea>
                        </div>
                    </>
                }
                onSuccessFn={async () => {
                    await completeTask({
                        variables: {
                            id: completeTaskId.current,
                            notes: completeNotesRef.current?.value ?? '',
                        },
                    });
                }}
                okButtonText={t('Complete')}
            />
        </>
    );
}
