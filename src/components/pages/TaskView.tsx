import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import { QUERY_TASK_WITH_HISTORY } from '../../graphql/queries';
import {
    periodTypeMonthsArray,
    periodTypeWeekDaysArray,
    DateFormateUtils,
    TimeToEventUtils,
} from '../../utils';
import BreadCrumbs, {
    useMakePathArray,
    updateBreadCrumbsPathArray,
} from '../layoutParts/BreadCrumbs';
import { useLanguage } from '../../languages';

type TaskHistory = {
    created_at: String;
    notes: String;
};
export default function TaskView() {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const t = useLanguage();

    const task = useQuery(QUERY_TASK_WITH_HISTORY, {
        variables: { id: taskId },
    });
    const breadCrumbsPathArray = updateBreadCrumbsPathArray(
        1,
        { name: task.data?.task?.name },
        useMakePathArray()
    );

    if (task.loading) return <Loading />;
    else if (taskId && task.data?.task === null) return <>404</>;

    let periodText = '';
    if (task.data.task.periodType == 1) {
        periodText = t('Daily');
    } else if (task.data.task.periodType == 2) {
        const periodTypeWeekDaysNames = task.data.task.periodTypeWeekDays?.map(
            (day: string) => {
                return t(periodTypeWeekDaysArray[parseInt(day) - 1]);
            }
        );
        periodText = t('Weekly on ') + periodTypeWeekDaysNames.join(', ');
    } else if (task.data.task.periodType == 3) {
        periodText =
            t('Monthly each ') +
            task.data.task.periodTypeMonthDays.join(t('th') + ', ') +
            t('th');
    } else if (task.data.task.periodType == 4) {
        const periodTypeMonthsNames = task.data.task.periodTypeMonths?.map(
            (month: string) => {
                return t(periodTypeMonthsArray[parseInt(month) - 1]);
            }
        );
        periodText =
            t('Yearly each ') +
            task.data.task.periodTypeMonthDays.join(t('th') + ', ') +
            t('th of ') +
            periodTypeMonthsNames.join(', ');
    }
    return (
        <>
            <BreadCrumbs breadCrumbsPathArray={breadCrumbsPathArray} />
            <div className="row">
                <div className="col-md-6">
                    <div className="taskViewDetail">
                        <a
                            className="btn btn-link taskViewDetailEditBtn"
                            title={t('Edit')}
                            href={'/tasks/' + taskId + '/edit'}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('../tasks/' + taskId + '/edit');
                            }}
                        >
                            <i className="bi bi-pencil-fill"></i>
                        </a>
                        <h2>{t('Task details')}</h2>
                        <div className="taskViewDetailDiv">
                            <h3 className="mb-3">{task.data.task.name}</h3>
                            {task.data.task.description && (
                                <div className="mb-3">
                                    {t('Description')}:{' '}
                                    {task.data.task.description}
                                </div>
                            )}
                            <div className="mb-3">
                                {t('Next event')}:{' '}
                                {DateFormateUtils(
                                    task.data.task.nextRunDateTime
                                )}{' '}
                                (
                                {TimeToEventUtils(
                                    task.data.task.nextRunDateTime,
                                    t
                                )}
                                )
                            </div>
                            <div className="mb-3">
                                {t('Period')}: {periodText} {t('at')}{' '}
                                {task.data.task.periodTypeTime}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
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
                                                    {DateFormateUtils(
                                                        history.created_at
                                                    )}
                                                </div>
                                                <div className="col-sm-8">
                                                    {history.notes}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="taskViewHistoryDiv">
                                {t('No records found')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
