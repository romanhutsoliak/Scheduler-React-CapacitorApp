import {useMutation, useQuery} from '@apollo/client';
import {useNavigate, useParams} from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import {COMPLETE_TASK, QUERY_TASK_WITH_HISTORY} from '../../graphql/queries';
import {DateFormatUtils, periodTypeMonthsArray, periodTypeWeekDaysArray, TimeToEventUtils,} from '../../utils';
import BreadCrumbs, {updateBreadCrumbsPathArray, useMakePathArray,} from '../layoutParts/BreadCrumbs';
import {useLanguage} from '../../languages';
import Modal from '../layoutParts/Modal';
import {useRef} from 'react';
import Nl2br from '../layoutParts/Nl2br';
import LoadingError from '../layoutParts/LoadingError';
import Error404 from '../layoutParts/Error404';
import {DateTime} from "luxon";

type TaskHistory = {
    created_at: string;
    notes: string;
};
export default function TaskView() {
    const navigate = useNavigate();
    const {taskId} = useParams();
    const t = useLanguage();
    const completeNotesRef = useRef<HTMLTextAreaElement>(null);

    const [completeTask] = useMutation(COMPLETE_TASK, {
        onError: () => null,
        onCompleted: () => {
        },
        refetchQueries: ['GetTaskWithHistory'],
    });
    const task = useQuery(QUERY_TASK_WITH_HISTORY, {
        variables: {id: taskId},
    });
    const breadCrumbsPathArray = updateBreadCrumbsPathArray(
        1,
        {name: task.data?.task?.name},
        useMakePathArray()
    );

    if (task.loading) {
        return <Loading/>;
    } else if (task.error) {
        return <LoadingError/>;
    } else if (taskId && task.data?.task === null) {
        return <Error404/>;
    }

    function getPeriodText() {
        let periodText = '';
        const taskPeriodTypeTime = DateTime.fromFormat(task?.data?.task?.periodTypeTime, 'HH:mm').toLocaleString(DateTime.TIME_SIMPLE);

        if (task?.data?.task?.periodType === 'Daily') {
            periodText = t('Daily at {time}', {
                time: taskPeriodTypeTime
            });
        } else if (task?.data?.task?.periodType === 'Weekly') {
            const periodTypeWeekDaysNames = task?.data?.task?.periodTypeWeekDays?.map(
                (day: string) => {
                    return t(periodTypeWeekDaysArray[parseInt(day) - 1]);
                }
            );
            periodText = t('Weekly on {weekDays} at {time}', {
                weekDays: periodTypeWeekDaysNames.join(', '),
                time: taskPeriodTypeTime
            });
        } else if (task?.data?.task?.periodType === 'Monthly') {
            periodText = t('Every month on {days} at {time}', {
                days: task?.data?.task?.periodTypeMonthDays.join(t('th') + ', ') + t('th'),
                time: taskPeriodTypeTime
            });
        } else if (task?.data?.task?.periodType === 'Yearly' || task?.data?.task?.periodType === 'Once') {
            const periodTypeMonthsNames = task?.data?.task?.periodTypeMonths?.map(
                (month: string) => {
                    return t(periodTypeMonthsArray[parseInt(month) - 1]);
                }
            );

            const periodTextYearText = task?.data?.task?.periodType === 'Yearly'
                ? 'Yearly each {days} of {months} at {time}'
                : 'Once on {days} of {months} at {time}';

            periodText = t(periodTextYearText, {
                days: task?.data?.task?.periodTypeMonthDays.join(t('th') + ', ') + t('th'),
                months: periodTypeMonthsNames.join(', '),
                time: taskPeriodTypeTime
            });
        }

        return periodText;
    }

    return (
        <>
            <BreadCrumbs breadCrumbsPathArray={breadCrumbsPathArray}/>
            <Modal
                title={t('Do you want to complete the task ?')}
                body={
                    <>
                        <div className="mb-3">
                            <textarea
                                id="completeNotesTextarea"
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
                            id: taskId,
                            notes: completeNotesRef.current?.value ?? '',
                        },
                    });
                }}
                okButtonText={t('Complete')}
            />
            <div className="row">
                <div className="col-lg-6">
                    <div className="taskViewDetail">
                        <a
                            className="btn btn-link taskViewDetailBtn taskViewDetailBtnEdit"
                            title={t('Edit')}
                            href={'/tasks/' + taskId + '/edit'}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('../tasks/' + taskId + '/edit');
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
                        {task?.data?.task?.isActive ? (
                            <button
                                className="btn btn-link taskViewDetailBtn taskViewDetailBtnComplete"
                                title={t('Complete')}
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#globalModal"
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
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path
                                        d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                </svg>
                            </button>
                        ) : (
                            ''
                        )}

                        <h2>{t('Task details')}</h2>
                        <div className="taskViewDetailDiv">
                            <h3 className="mb-3">{task?.data?.task?.name}</h3>
                            {task?.data?.task?.description && (
                                <div className="mb-3">
                                    {t('Description')}:{' '}
                                    {task?.data?.task?.description?.split('\n').map(function (descriptionPart: string, key: string) {
                                        return (
                                            <span key={key}>
                                                {descriptionPart}
                                                <br/>
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                            <div className="mb-3">
                                {t('Next event')}:{' '}
                                <span
                                    className={
                                        Date.parse(
                                            task?.data?.task?.nextRunDateTime
                                        ) < Date.now()
                                            ? 'tasksDetailNextDate_passed'
                                            : ''
                                    }
                                >
                                    {DateFormatUtils(
                                        task?.data?.task?.nextRunDateTime,
                                        false
                                    )}{' '}
                                    (
                                    {TimeToEventUtils(
                                        task?.data?.task?.nextRunDateTime,
                                        t
                                    )}
                                    )
                                </span>
                            </div>
                            <div className="mb-3">
                                {t('Period')}: {getPeriodText()}
                            </div>
                            <div className="mb-3">
                                {t('Is active')}:{' '}
                                {task?.data?.task?.isActive ? t('Yes') : t('No')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="taskViewHistory">
                        <h2>{t('Event history')}</h2>
                        {task?.data?.taskHistory?.length ? (
                            task.data.taskHistory.map(
                                (history: TaskHistory) => {
                                    return (
                                        <div
                                            className="taskViewHistoryDiv"
                                            key={history.created_at.toString()}
                                        >
                                            <div className="row">
                                                <div className="col-sm-4">
                                                    {DateFormatUtils(
                                                        history.created_at
                                                    )}
                                                </div>
                                                {history.notes &&
                                                    <div className="col-sm-8 taskViewHistoryDivText">
                                                        <Nl2br
                                                            text={history.notes}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="taskViewHistoryDiv taskViewHistoryNoEvents">
                                {t('No records found')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
