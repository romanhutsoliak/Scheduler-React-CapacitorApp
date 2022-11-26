import { useEffect, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import {
    QUERY_TASK,
    UPDATE_TASK,
    CREATE_TASK,
    DELETE_TASK,
} from '../../graphql/queries';
import { useForm } from 'react-hook-form';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';
import { periodTypeMonthsArray, periodTypeWeekDaysArray } from '../../utils';
import BreadCrumbs, {
    useMakePathArray,
    updateBreadCrumbsPathArray,
} from '../layoutParts/BreadCrumbs';
import { useLanguage } from '../../languages';
import Modal from '../layoutParts/Modal';

type TaskFormValuesType = {
    name: string;
    description: string;
    periodType: string;
    mustBeCompleted: boolean;
    isActive: boolean;
    periodTypeTime: string;
    periodTypeWeekDays: number[] | null;
    periodTypeMonthDays: number[] | null;
    periodTypeMonths: number[] | null;

    // once periodType
    periodTypeMonthDaysRadio?: number | null;
    periodTypeMonthsRadio?: number | null;
    // yearly periodType
    periodTypeMonthDaysCheckbox?: number[] | null;
    periodTypeMonthsCheckbox?: number[] | null;
};

function SaveButton({
    buttonLoading,
    showRemoveBtn,
}: {
    buttonLoading: boolean;
    showRemoveBtn: boolean;
}) {
    const t = useLanguage();
    return (
        <div className="d-flex justify-content-between">
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
                        &nbsp; {t('Saving')}...
                    </>
                ) : (
                    t('Save')
                )}
            </button>
            {showRemoveBtn ? (
                <button
                    type="button"
                    className="btn btn-link mb-3 text-danger taskEditRemoveBtn"
                    data-bs-toggle="modal"
                    data-bs-target="#globalModal"
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    {t('Remove')}
                </button>
            ) : (
                ''
            )}
        </div>
    );
}

export default function TaskEdit() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        getValues,
        setValue,
    } = useForm<TaskFormValuesType>();
    const [periodTypeState, setPeriodTypeState] = useState(1);
    const navigate = useNavigate();
    const { taskId } = useParams();
    const t = useLanguage();
    const [loadTask, loadingTask] = useLazyQuery(QUERY_TASK, {
        variables: { id: taskId },
        onCompleted: (data) => {
            if (data.task) {
                setValue('name', data.task.name);
                setValue('description', data.task.description);
                setValue('isActive', data.task.isActive);
                setValue('mustBeCompleted', data.task.mustBeCompleted);
                setValue('periodType', data.task.periodType);
                setValue('periodTypeTime', data.task.periodTypeTime);
                setValue('periodTypeWeekDays', data.task.periodTypeWeekDays);
                setValue(
                    'periodTypeMonthDaysRadio',
                    data.task.periodTypeMonthDays[0] ?? null
                );
                setValue(
                    'periodTypeMonthsRadio',
                    data.task.periodTypeMonths[0] ?? null
                );
                setValue(
                    'periodTypeMonthDaysCheckbox',
                    data.task.periodTypeMonthDays
                );
                setValue(
                    'periodTypeMonthsCheckbox',
                    data.task.periodTypeMonths
                );
                if (
                    data.task.periodType &&
                    parseInt(data.task.periodType) !== periodTypeState
                )
                    setPeriodTypeState(parseInt(data.task.periodType));
            }
        },
    });
    const [updateTask, updatingTask] = useMutation(UPDATE_TASK, {
        onError: () => null,
    });
    const [deleteTask, deletingTask] = useMutation(DELETE_TASK, {
        onError: () => null,
    });
    const [createTask, creatingTask] = useMutation(CREATE_TASK, {
        onError: () => null,
    });
    useEffect(() => {
        if (taskId) loadTask();
        else {
            setValue('isActive', true);
            setValue('mustBeCompleted', true);
        }
    }, []);
    const breadCrumbsPathArray = updateBreadCrumbsPathArray(
        1,
        { name: loadingTask.data?.task?.name ?? t('Create') },
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
            mustBeCompleted: data.mustBeCompleted,
            isActive: data.isActive,
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
                periodTypeMonthDays: data.periodTypeMonthDaysCheckbox || null,
            };
        }
        if (data.periodType === '4') {
            variables = {
                ...variables,
                periodTypeMonths: data.periodTypeMonthsCheckbox || null,
            };
        }
        // radio buttons
        if (data.periodType === '5') {
            variables = {
                ...variables,
                periodTypeMonthDays: [data.periodTypeMonthDaysRadio as number],
                periodTypeMonths: [data.periodTypeMonthsRadio as number],
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

    // format 24:00 input
    function periodTypeTimeInputFormat(
        currentValue: string,
        prevValue: string
    ): string | null {
        let periodTypeTimeRes = currentValue.replace(/[^\d:]+/, '');
        if (periodTypeTimeRes !== currentValue) return periodTypeTimeRes;

        periodTypeTimeRes = periodTypeTimeRes.replace(
            /^(\d{2})\:?(\d{0,2})$/,
            '$1:$2'
        );
        const matchArray = /^(\d+):(\d+)$/.exec(periodTypeTimeRes);
        if (matchArray && matchArray[1] && matchArray[2]) {
            matchArray[1] = matchArray[1].slice(0, 2);
            matchArray[2] = matchArray[2].slice(0, 2);
            if (parseInt(matchArray[1]) > 24) matchArray[1] = '24';
            if (parseInt(matchArray[2]) > 59) matchArray[2] = '59';
            periodTypeTimeRes = matchArray[1] + ':' + matchArray[2];
        }
        if (
            !(
                prevValue === periodTypeTimeRes &&
                periodTypeTimeRes.slice(-1) === ':'
            )
        ) {
            return periodTypeTimeRes;
        }
        return null;
    }

    return (
        <>
            <BreadCrumbs breadCrumbsPathArray={breadCrumbsPathArray} />
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-md-6">
                        <h2>{t('Task details')}</h2>
                        <div className="mb-3">
                            <label
                                htmlFor="inputName"
                                className="htmlForm-label"
                            >
                                {t('Name')}
                            </label>
                            <input
                                type="text"
                                className={
                                    'form-control ' +
                                    (errors.name ? 'is-invalid' : '')
                                }
                                id="inputName"
                                placeholder={t('Go shopping')}
                                {...register('name', {
                                    required: t('Name is required.'),
                                })}
                            />
                            <p className="invalid-feedback">
                                {t(errors?.name?.message as string)}
                            </p>
                        </div>
                        <div className="mb-3">
                            <label
                                htmlFor="inputDescription"
                                className="htmlForm-label"
                            >
                                {t('Description')}
                            </label>
                            <textarea
                                className={
                                    'form-control ' +
                                    (errors.description ? 'is-invalid' : '')
                                }
                                id="inputDescription"
                                placeholder={t('Shopping list')}
                                rows={3}
                                {...register('description')}
                            ></textarea>
                            <p className="invalid-feedback">
                                {t(errors?.description?.message as string)}
                            </p>
                        </div>
                        <div className="mb-3">
                            <input
                                type="checkbox"
                                className={
                                    'form-check-input ' +
                                    (errors.isActive ? 'is-invalid' : '')
                                }
                                id="inputIsActive"
                                {...register('isActive')}
                                onChange={(e) => {
                                    setValue(
                                        'isActive',
                                        e.target.checked ? true : false
                                    );
                                }}
                            />{' '}
                            <label
                                htmlFor="inputIsActive"
                                className="htmlForm-label"
                            >
                                {t('Is active')}
                            </label>
                            <p className="invalid-feedback">
                                {t(errors?.isActive?.message as string)}
                            </p>
                        </div>
                        <div className="mb-3">
                            <input
                                type="checkbox"
                                className={
                                    'form-check-input ' +
                                    (errors.mustBeCompleted ? 'is-invalid' : '')
                                }
                                id="inputMustBeCompleted"
                                {...register('mustBeCompleted')}
                                onChange={(e) => {
                                    setValue(
                                        'mustBeCompleted',
                                        e.target.checked ? true : false
                                    );
                                }}
                            />{' '}
                            <label
                                htmlFor="inputMustBeCompleted"
                                className="htmlForm-label"
                            >
                                {t('Must be completed')}
                            </label>
                            <p className="invalid-feedback">
                                {t(errors?.mustBeCompleted?.message as string)}
                            </p>
                        </div>
                        <div className="text-start d-none d-md-block">
                            <SaveButton
                                buttonLoading={buttonLoading}
                                showRemoveBtn={taskId ? true : false}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h2>{t('Schedule')}</h2>
                        <div className="mb-3">
                            <label
                                htmlFor="inputPeriodType"
                                className="htmlForm-label"
                            >
                                {t('Period type')}
                            </label>
                            <select
                                className={
                                    'form-select ' +
                                    (errors.periodType ? 'is-invalid' : '')
                                }
                                aria-label="Default select example"
                                {...register('periodType', {
                                    required: t('Period type is required.'),
                                    onChange: (e) => {
                                        setPeriodTypeState(
                                            parseInt(e.target.value)
                                        );
                                    },
                                })}
                            >
                                <option disabled>{t('Select period')}</option>
                                <option value="1">{t('Daily')}</option>
                                <option value="2">{t('Weekly')}</option>
                                <option value="3">{t('Monthly')}</option>
                                <option value="4">{t('Yearly')}</option>
                                <option value="5">{t('Once')}</option>
                            </select>
                            <p className="invalid-feedback">
                                {errors?.periodType &&
                                    t(errors?.periodType?.message as string)}
                            </p>
                        </div>
                        <div className="periodTypeContainer">
                            <div className="periodTypeTimeC mb-3">
                                <label
                                    htmlFor="inputPeriodTypeTime"
                                    className="htmlForm-label"
                                >
                                    {t('Time')}
                                </label>
                                <input
                                    type="text"
                                    className={
                                        'form-control ' +
                                        (errors.periodTypeTime
                                            ? 'is-invalid'
                                            : '')
                                    }
                                    id="inputPeriodType"
                                    {...register('periodTypeTime', {
                                        required: 'Time is required.',
                                        pattern: {
                                            value: /^\d{2}:\d{2}$/i,
                                            message: t(
                                                'Invalid time (example 15:30)'
                                            ),
                                        },
                                    })}
                                    onChange={(e) => {
                                        const prevValue =
                                            getValues('periodTypeTime');

                                        const periodTypeTimeValue =
                                            periodTypeTimeInputFormat(
                                                e.target.value,
                                                prevValue
                                            );

                                        if (periodTypeTimeValue !== null) {
                                            setValue(
                                                'periodTypeTime',
                                                periodTypeTimeValue
                                            );
                                        }
                                    }}
                                    placeholder="24:00"
                                />
                                <p className="invalid-feedback">
                                    {errors?.periodTypeTime &&
                                        t(
                                            errors?.periodTypeTime
                                                ?.message as string
                                        )}
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
                                                                (errors.periodTypeWeekDays
                                                                    ? 'is-invalid'
                                                                    : '')
                                                            }
                                                            id={
                                                                'periodTypeWeekDaysArray' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeWeekDays',
                                                                {
                                                                    required: t(
                                                                        'Week day is required.'
                                                                    ),
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'periodTypeWeekDaysArray' +
                                                                i
                                                            }
                                                        >
                                                            {t(weekDay)}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                    <p className="invalid-feedback">
                                        {t(
                                            errors?.periodTypeWeekDays
                                                ?.message as string
                                        )}
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
                                                                (errors.periodTypeMonthDaysCheckbox
                                                                    ? 'is-invalid'
                                                                    : '')
                                                            }
                                                            id={
                                                                'periodTypeMonthDaysCheckbox' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeMonthDaysCheckbox',
                                                                {
                                                                    required: t(
                                                                        'Month day is required.'
                                                                    ),
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'periodTypeMonthDaysCheckbox' +
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
                                            {t(
                                                errors?.periodTypeMonthDays
                                                    ?.message as string
                                            )}
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
                                                                (errors.periodTypeMonthsCheckbox
                                                                    ? 'is-invalid'
                                                                    : '')
                                                            }
                                                            id={
                                                                'periodTypeMonthsCheckbox' +
                                                                i
                                                            }
                                                            {...register(
                                                                'periodTypeMonthsCheckbox',
                                                                {
                                                                    required:
                                                                        t(
                                                                            'Month is required.'
                                                                        ),
                                                                }
                                                            )}
                                                            value={i + 1}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={
                                                                'periodTypeMonthsCheckbox' +
                                                                i
                                                            }
                                                        >
                                                            {t(month)}
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

                            {periodTypeState === 5 ? (
                                <>
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
                                                                type="radio"
                                                                className={
                                                                    'form-check-input ' +
                                                                    (errors.periodTypeMonthDaysRadio
                                                                        ? 'is-invalid'
                                                                        : '')
                                                                }
                                                                id={
                                                                    'periodTypeMonthDaysRadio' +
                                                                    i
                                                                }
                                                                {...register(
                                                                    'periodTypeMonthDaysRadio',
                                                                    {
                                                                        required:
                                                                            t(
                                                                                'Month day is required.'
                                                                            ),
                                                                    }
                                                                )}
                                                                value={i + 1}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={
                                                                    'periodTypeMonthDaysRadio' +
                                                                    i
                                                                }
                                                            >
                                                                {monthDay.length ===
                                                                1
                                                                    ? '0' +
                                                                      monthDay
                                                                    : monthDay}
                                                            </label>
                                                        </div>
                                                    );
                                                }
                                            )}
                                            <p className="invalid-feedback">
                                                {t(
                                                    errors?.periodTypeMonthDays
                                                        ?.message as string
                                                )}
                                            </p>
                                        </div>
                                    </div>
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
                                                                type="radio"
                                                                className={
                                                                    'form-check-input ' +
                                                                    (errors.periodTypeMonthsRadio
                                                                        ? 'is-invalid'
                                                                        : '')
                                                                }
                                                                id={
                                                                    'periodTypeMonthsRadio' +
                                                                    i
                                                                }
                                                                {...register(
                                                                    'periodTypeMonthsRadio',
                                                                    {
                                                                        required:
                                                                            t(
                                                                                'Month is required.'
                                                                            ),
                                                                    }
                                                                )}
                                                                value={i + 1}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={
                                                                    'periodTypeMonthsRadio' +
                                                                    i
                                                                }
                                                            >
                                                                {t(month)}
                                                            </label>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                    <div className="text-start d-md-none">
                        <SaveButton
                            buttonLoading={buttonLoading}
                            showRemoveBtn={taskId ? true : false}
                        />
                    </div>
                </div>
            </form>
            <Modal
                title={t('Are you sure you want to remove this task?')}
                onSuccessFn={async () => {
                    await deleteTask({
                        variables: {
                            id: taskId,
                        },
                    });
                    navigate('/tasks');
                }}
                okButtonText={t('Remove task')}
                okButtonClass="btn-danger removeTaskConfirmBtn"
            />
        </>
    );
}
