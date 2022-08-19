import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import { QUERY_TASK_WITH_HISTORY } from '../../graphql/queries';
import {
    periodTypeMonthsArray,
    periodTypeWeekDaysArray,
    DateFormateUtils,
} from '../../utils';

type TaskHistory = {
    created_at: String;
    notes: String;
};
export default function TaskView() {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const task = useQuery(QUERY_TASK_WITH_HISTORY, {
        variables: { id: taskId },
    });

    if (task.loading) return <Loading />;
    else if (taskId && task.data?.task === null) return <>404</>;

    let periodText = '';
    if (task.data.task.periodType == 1) {
        periodText = 'Daily';
    } else if (task.data.task.periodType == 2) {
        const periodTypeWeekDaysNames = task.data.task.periodTypeWeekDays?.map(
            (day: string) => {
                return periodTypeWeekDaysArray[parseInt(day) - 1];
            }
        );
        periodText = 'Weekly on ' + periodTypeWeekDaysNames.join(', ');
    } else if (task.data.task.periodType == 3) {
        periodText =
            'Monthly each ' +
            task.data.task.periodTypeMonthDays.join('th, ') +
            'th';
    } else if (task.data.task.periodType == 4) {
        const periodTypeMonthsNames = task.data.task.periodTypeMonths?.map(
            (month: string) => {
                return periodTypeMonthsArray[parseInt(month) - 1];
            }
        );
        periodText =
            'Yearly each ' +
            task.data.task.periodTypeMonthDays.join('th, ') +
            'th of ' +
            periodTypeMonthsNames.join(', ');
    }
    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    <div className="taskViewDetail">
                        <h2>Task details</h2>
                        <div className="taskViewDetailDiv">
                            <h3 className="mb-3">{task.data.task.name}</h3>
                            {task.data.task.description && (
                                <div className="mb-3">
                                    Description: {task.data.task.description}
                                </div>
                            )}
                            <div className="mb-3">
                                Period: {periodText} at{' '}
                                {task.data.task.periodTypeTime}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="taskViewHistory">
                        <h2>Event history</h2>
                        {task.data.taskHistory &&
                        task.data.taskHistory.length ? (
                            task.data.taskHistory.map(
                                (history: TaskHistory) => {
                                    return (
                                        <div className="taskViewHistoryDiv">
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
                                No records found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
