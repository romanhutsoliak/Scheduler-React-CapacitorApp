import { useEffect, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import { QUERY_TASK, UPDATE_TASK, CREATE_TASK } from '../../graphql/queries';
import { useForm } from 'react-hook-form';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';
import { periodTypeMonthsArray, periodTypeWeekDaysArray } from '../../utils';
import BreadCrumbs, {
    useMakePathArray,
    updateBreadCrumbsPathArray,
} from '../layoutParts/BreadCrumbs';

type TaskFormValuesType = {
    name: string;
    description: string;
    periodType: string;
    periodTypeTime: string;
    periodTypeWeekDays: number[] | null;
    periodTypeMonthDays: number[] | null;
    periodTypeMonths: number[] | null;
};

export default function TaskEdit() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm<TaskFormValuesType>();
    const [periodTypeState, setPeriodTypeState] = useState(1);
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [loadTask, loadingTask] = useLazyQuery(QUERY_TASK, {
        variables: { id: taskId },
        onCompleted: (data) => {
            if (data.task) {
                setValue('name', data.task.name);
                setValue('description', data.task.description);
                setValue('periodType', data.task.periodType);
                setValue('periodTypeTime', data.task.periodTypeTime);
                setValue('periodTypeWeekDays', data.task.periodTypeWeekDays);
                setValue('periodTypeMonthDays', data.task.periodTypeMonthDays);
                setValue('periodTypeMonths', data.task.periodTypeMonths);
                if (
                    data.task.periodType &&
                    parseInt(data.task.periodType) != periodTypeState
                )
                    setPeriodTypeState(parseInt(data.task.periodType));
            }
        },
    });
    const [updateTask, updatingTask] = useMutation(UPDATE_TASK, {
        onError: () => null,
    });
    const [createTask, creatingTask] = useMutation(CREATE_TASK, {
        onError: () => null,
    });
    useEffect(() => {
        if (taskId) loadTask();
    }, []);
    const breadCrumbsPathArray = updateBreadCrumbsPathArray(
        1,
        { name: loadingTask.data?.task?.name ?? 'Create' },
        useMakePathArray()
    );

    if (loadingTask.loading) return <Loading />;
    else if (taskId && loadingTask.data?.task === null) return <>404</>;

    const buttonLoading = updatingTask.loading || creatingTask.loading;

    async function onSubmit(data: TaskFormValuesType) {
        let variables: TaskFormValuesType & { id: String | undefined } = {
            id: taskId,
            name: data.name,
            description: data.description,
            periodType: data.periodType,
            periodTypeTime: data.periodTypeTime,
            periodTypeWeekDays: null,
            periodTypeMonthDays: null,
            periodTypeMonths: null,
        };
        if (data.periodType === '2') {
            variables = {
                ...variables,
                periodTypeWeekDays: data.periodTypeWeekDays,
            };
        }
        if (['3', '4'].includes(data.periodType)) {
            variables = {
                ...variables,
                periodTypeMonthDays: data.periodTypeMonthDays,
            };
        }
        if (data.periodType === '4') {
            variables = {
                ...variables,
                periodTypeMonths: data.periodTypeMonths,
            };
        }

        let responseData = null;
        if (taskId) {
            responseData = await updateTask({
                variables,
            });
        } else {
            responseData = await createTask({
                variables,
            });
            navigate('/tasks/' + responseData.data.createTask.id, {
                // replace: true,
            });
        }

        // server side errors
        if (responseData.errors) {
            const responseDataErrors: any = responseData.errors;
            responseDataErrors.graphQLErrors.forEach(
                (error: ApiGraphQLValidationError) => {
                    Object.keys(data).forEach((fieldName: any) => {
                        if (error.extensions?.validation[fieldName]) {
                            setError(fieldName, {
                                type: 'custom',
                                message:
                                    error.extensions.validation[fieldName][0] ??
                                    '',
                            });
                        }
                    });
                }
            );
        }
    }

    // render variables
    let periodTypeMonthDaysArray = [];
    for (let i = 1; i <= 31; i++) periodTypeMonthDaysArray.push(i.toString());

    return (
        <>
            <BreadCrumbs breadCrumbsPathArray={breadCrumbsPathArray} />
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-md-6">
                        <h2>Task details</h2>
                        <div className="mb-3">
                            <label
                                htmlFor="inputName"
                                className="htmlForm-label"
                            >
                                Name
                            </label>
                            <input
                                type="name"
                                className={
                                    'form-control ' +
                                    (errors.name && 'is-invalid')
                                }
                                id="inputName"
                                {...register('name', {
                                    required: 'Name is required.',
                                })}
                            />
                            <p className="invalid-feedback">
                                {errors.name && errors.name.message}
                            </p>
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="inputDescription"
                                className="htmlForm-label"
                            >
                                Description
                            </label>
                            <textarea
                                className={
                                    'form-control ' +
                                    (errors.description && 'is-invalid')
                                }
                                id="inputDescription"
                                rows={3}
                                {...register('description')}
                            ></textarea>
                            <p className="invalid-feedback">
                                {errors.description &&
                                    errors.description.message}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary mb-3"
                            disabled={buttonLoading ? true : false}
                        >
                            {buttonLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    &nbsp; Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                    <div className="col-md-6">
                        <h2>Schedule</h2>
                        <div className="mb-3">
                            <label
                                htmlFor="inputPeriodType"
                                className="htmlForm-label"
                            >
                                Period type
                            </label>
                            <select
                                className={
                                    'form-select ' +
                                    (errors.periodType && 'is-invalid')
                                }
                                aria-label="Default select example"
                                {...register('periodType', {
                                    required: 'Period type is required.',
                                    onChange: (e) => {
                                        setPeriodTypeState(
                                            parseInt(e.target.value)
                                        );
                                    },
                                })}
                            >
                                <option disabled>Select period</option>
                                <option value="1">Daily</option>
                                <option value="2">Weekly</option>
                                <option value="3">Monthly</option>
                                <option value="4">Yearly</option>
                                <option value="5">Once</option>
                            </select>
                            <p className="invalid-feedback">
                                {errors.periodType && errors.periodType.message}
                            </p>
                        </div>
                        <div className="periodTypeContainer">
                            <div className="periodTypeTimeC mb-3">
                                <label
                                    htmlFor="inputPeriodTypeTime"
                                    className="htmlForm-label"
                                >
                                    Time
                                </label>
                                <input
                                    type="name"
                                    className={
                                        'form-control ' +
                                        (errors.periodTypeTime && 'is-invalid')
                                    }
                                    id="inputPeriodType"
                                    {...register('periodTypeTime', {
                                        required: 'Name is required.',
                                        pattern: {
                                            value: /^\d{2}\:\d{2}$/i,
                                            message:
                                                'Invalid time (example 15:30)',
                                        },
                                    })}
                                    placeholder="24:00"
                                />
                                <p className="invalid-feedback">
                                    {errors.periodTypeTime &&
                                        errors.periodTypeTime.message}
                                </p>
                            </div>
                            {periodTypeState === 2 ? (
                                <div
                                    className={
                                        'periodTypeWeekDaysC' +
                                        (periodTypeState !== 2 ? ' d-none' : '')
                                    }
                                >
                                    <div className="mb-3">
                                        {periodTypeWeekDaysArray.map(
                                            (weekDay, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline"
                                                        key={i}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={
                                                                'form-check-input ' +
                                                                (errors.periodTypeWeekDays &&
                                                                    'is-invalid')
                                                            }
                                                            id={
                                                                'inputPeriodTypeWeekDay' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeWeekDays',
                                                                {
                                                                    required:
                                                                        'Name is required.',
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'inputPeriodTypeWeekDay' +
                                                                i
                                                            }
                                                        >
                                                            {weekDay}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    <p className="invalid-feedback">
                                        {errors.periodTypeWeekDays &&
                                            errors.periodTypeWeekDays.message}
                                    </p>
                                </div>
                            ) : (
                                ''
                            )}
                            {[3, 4].includes(periodTypeState) ? (
                                <div className="periodTypeMonthDaysC">
                                    <div className="mb-3">
                                        {periodTypeMonthDaysArray.map(
                                            (monthDay, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline"
                                                        key={i}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={
                                                                'form-check-input ' +
                                                                (errors.periodTypeMonthDays &&
                                                                    'is-invalid')
                                                            }
                                                            id={
                                                                'periodTypeMonthDay' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeMonthDays',
                                                                {
                                                                    required:
                                                                        'Name is required.',
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'inputPeriodTypeMonthDay' +
                                                                i
                                                            }
                                                        >
                                                            {monthDay.length ===
                                                            1
                                                                ? '0' + monthDay
                                                                : monthDay}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        )}
                                        <p className="invalid-feedback">
                                            {errors.periodTypeMonthDays &&
                                                errors.periodTypeMonthDays
                                                    .message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                            {periodTypeState === 4 ? (
                                <div className="periodTypeDiv4">
                                    <div className="mb-3">
                                        {periodTypeMonthsArray.map(
                                            (month, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline"
                                                        key={i}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={
                                                                'form-check-input ' +
                                                                (errors.periodTypeMonths &&
                                                                    'is-invalid')
                                                            }
                                                            id={
                                                                'periodTypeMonths' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeMonths',
                                                                {
                                                                    required:
                                                                        'Name is required.',
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'inputPeriodTypeMonthDay' +
                                                                i
                                                            }
                                                        >
                                                            {month}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
