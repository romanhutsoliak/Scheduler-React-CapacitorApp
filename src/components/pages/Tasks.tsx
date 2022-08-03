import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_TASKS } from '../../graphql/queries';
import Loading from '../layoutParts/Loading';
import Pagination from '../layoutParts/Pagination';

type GetTaskResponseType = {
    id?: number;
    name: string;
    nextRunDateTime: string;
    hasEvent: boolean;
};

export default function Tasks() {
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10); // , setRecordsPerPage

    const navigate = useNavigate();

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
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Next run time</th>
                        <th scope="col">Has event</th>
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
                                    <td>{nextRunDateTime}</td>
                                    <td>{hasEvent}</td>
                                    <td>
                                        <a
                                            className=""
                                            href={'/tasks/' + id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('../tasks/' + id);
                                            }}
                                        >
                                            Detail
                                        </a>
                                    </td>
                                </tr>
                            )
                        )}
                </tbody>
            </table>
            {data && data.tasks && data.tasks.paginatorInfo ? (
                <Pagination
                    lastPage={data.tasks.paginatorInfo.lastPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            ) : (
                ''
            )}

            <div className="text-align-right">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../tasks/create');
                    }}
                >
                    Create new task
                </button>
            </div>
        </div>
    );
}
