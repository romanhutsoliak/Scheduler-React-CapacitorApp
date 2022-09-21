import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GET_TASKS, COMPLETE_TASK } from '../../graphql/queries';
import Loading from '../layoutParts/Loading';
import Pagination from '../layoutParts/Pagination';
import Modal from '../layoutParts/Modal';
import { DateFormateUtils, TimeToEventUtils } from '../../utils';
import { useLanguage } from '../../languages';

type GetTaskResponseType = {
    id?: number;
    name: string;
    nextRunDateTime: string;
    hasEvent: boolean;
};

export default function Tasks() {
    const [searchParams] = useSearchParams();
    const searchParamsPage = searchParams.get('page');
    const [currentPage, setCurrentPage] = useState(searchParamsPage ? parseInt(searchParamsPage) : 1);
    const [recordsPerPage] = useState(10); // , setRecordsPerPage
    const completeTaskId = useRef<number | undefined>();
    const completeNotesRef = useRef<HTMLTextAreaElement>(null);

    const navigate = useNavigate();
    const t = useLanguage();

    const [completeTask] = useMutation(COMPLETE_TASK, {
        onError: () => null,
        onCompleted: (data) => {},
    });

    // add new task (+) fixed button 
    const scrollEventHandler = () => {
        const taskButtonC = document.getElementsByClassName('addTaskButtonC')[0] as HTMLElement | null;
        // for mobile devices only
        if (taskButtonC && window.innerWidth < 992) {
            console.log(taskButtonC.offsetTop+' > '+window.innerHeight+' && '+(window.scrollY + window.innerHeight)+' < '+taskButtonC.offsetTop)
            if (taskButtonC.offsetTop > window.innerHeight && (window.scrollY + window.innerHeight) < taskButtonC.offsetTop) {
                taskButtonC.classList.add('addTaskButtonCFixed');
            } else {
                taskButtonC.classList.remove('addTaskButtonCFixed');
            }
        }
    };
    useEffect(() => {
        document.addEventListener('scroll', scrollEventHandler);

        return () => {
            document.removeEventListener('scroll', scrollEventHandler);
        };
    }, []);

    const { loading, error, data } = useQuery(GET_TASKS, {
        variables: {
            recordsPerPage,
            currentPage,
        },
        onCompleted: (data) => {
            scrollEventHandler();
        },
    });
    if (loading) return <Loading />;
    if (error) return <p>Network error :(</p>;

    const onClickDetailHandler = (
        event: React.MouseEvent<HTMLElement>,
        id: number | undefined
    ) => {
        event.preventDefault();
        navigate('../tasks/' + id);
    };

    return (
        <>
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
            <h1>{t('Tasks')}</h1>
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
                        {data &&
                            data.tasks &&
                            data.tasks.data.map(
                                (
                                    {
                                        id,
                                        name,
                                        nextRunDateTime,
                                        hasEvent,
                                    }: GetTaskResponseType,
                                    index: number
                                ) => (
                                    <tr key={id}>
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
                                            <br className="d-block d-sm-none" />
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
                                                <i className="bi bi-eye"></i>
                                            </a>
                                            <button
                                                className="btn btn-link"
                                                title={t('Complete')}
                                                type="button"
                                                data-bs-toggle="modal"
                                                data-bs-target="#globalModal"
                                                onClick={() => {
                                                    completeTaskId.current = id;
                                                }}
                                            >
                                                <i className="bi bi-check-circle"></i>
                                            </button>
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
                                                <i className="bi bi-pencil-fill"></i>
                                            </a>
                                        </td>
                                    </tr>
                                )
                            )}
                    </tbody>
                </table>
            </div>
            {data && data.tasks && data.tasks.paginatorInfo ? (
                <Pagination
                    lastPage={data.tasks.paginatorInfo.lastPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            ) : (
                ''
            )}
            <div className="text-end addTaskButtonC addTaskButtonCFixed">
                <button
                    type="button"
                    className="btn btn-primary btn-sm addTaskButton"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../tasks/create');
                    }}
                    title={t('Create new task')}
                >
                    <i className="bi bi-plus-circle"></i><span className="addTaskButtonSpan"> {t('Create new task')}</span>
                </button>
            </div>
        </>
    );
}
