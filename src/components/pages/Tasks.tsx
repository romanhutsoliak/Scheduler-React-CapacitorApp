import { TextareaHTMLAttributes, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_TASKS, COMPLETE_TASK } from '../../graphql/queries';
import Loading from '../layoutParts/Loading';
import Pagination from '../layoutParts/Pagination';
import Modal from '../layoutParts/Modal';
import { DateFormateUtils } from '../../utils';

type GetTaskResponseType = {
    id?: number;
    name: string;
    nextRunDateTime: string;
    hasEvent: boolean;
};

export default function Tasks() {
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10); // , setRecordsPerPage
    const completeTaskId = useRef<number | undefined>();
    const completeNotesRef = useRef<HTMLTextAreaElement>(null);

    const navigate = useNavigate();

    const [completeTask] = useMutation(COMPLETE_TASK, {
        onError: () => null,
        onCompleted: (data) => {},
    });
    const { loading, error, data } = useQuery(GET_TASKS, {
        variables: {
            recordsPerPage,
            currentPage,
        },
        onCompleted: (data) => {},
    });
    if (loading) return <Loading />;
    if (error) return <p>Network error :(</p>;

    return (
        <div>
            <Modal
                title="Complete task"
                body={
                    <>
                        <div>Do you want to complete the task ?</div>
                        <br />
                        <div className="mb-3">
                            <textarea
                                ref={completeNotesRef}
                                className="form-control"
                                rows={3}
                                placeholder="Complete notes (optional)"
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
                okButtonText="Complete"
            />
            <div className="text-end">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../tasks/create');
                    }}
                >
                    <i className="bi bi-plus-circle"></i> Create new task
                </button>
            </div>
            <div className="table-responsive">
                <table className="table table-responsive">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Next run time</th>
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
                                        <td>{index + 1}</td>
                                        <td>{name}</td>
                                        <td>
                                            {DateFormateUtils(nextRunDateTime)}
                                        </td>
                                        <td className="text-end">
                                            <a
                                                className="btn btn-link"
                                                title="Details"
                                                href={'/tasks/' + id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate('../tasks/' + id);
                                                }}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </a>
                                            <button
                                                className="btn btn-link"
                                                title="Complete"
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
                                                title="Edit"
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
        </div>
    );
}
