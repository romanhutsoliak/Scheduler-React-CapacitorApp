import {useCallback, useEffect, useRef, useState} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import {useNavigate, useParams} from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import {CREATE_TASK, DELETE_TASK, QUERY_TASK, TASK_CATEGORIES_ALL, UPDATE_TASK} from '../../graphql/queries';
import {useForm} from 'react-hook-form';
import {ApiGraphQLValidationError} from '../../types/ApiGraphQLErrorsErrors';
import {periodTypeMonthsArray, periodTypeWeekDaysArray} from '../../utils';
import BreadCrumbs, {updateBreadCrumbsPathArray, useMakePathArray} from '../layoutParts/BreadCrumbs';
import {useLanguage} from '../../languages';
import Modal from '../layoutParts/Modal';
import LoadingError from '../layoutParts/LoadingError';
import Error404 from '../layoutParts/Error404';
// @ts-ignore
import {Tooltip} from 'bootstrap/dist/js/bootstrap.esm.js';
import {DateTime} from "luxon";

type TaskFormValuesType = {
    name: string;
    description: string;
    periodType: string;
    categoryName: string;
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
                disabled={buttonLoading}
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
        formState: {errors},
        setError,
        getValues,
        setValue,
    } = useForm<TaskFormValuesType>();
    const [periodTypeState, setPeriodTypeState] = useState('');
    const navigate = useNavigate();
    const {taskId} = useParams();
    const t = useLanguage();
    const categoryNameOptions = useRef([]);
    const tooltipObjectsList = useRef<any[]>([]);
    const [periodTypeTimeHours, setPeriodTypeTimeHours] = useState('');
    const [periodTypeTimeMinutes, setPeriodTypeTimeMinutes] = useState('');
    const [periodTypeTimeAmPm, setPeriodTypeTimeAmPm] = useState('');
    const [periodTypeTimeHasAmPm, setPeriodTypeTimeHasAmPm] = useState(false);
    const [loadTask, loadingTask] = useLazyQuery(QUERY_TASK, {
        variables: {id: taskId},
        onCompleted: (data) => {
            if (data.task) {
                setValue('name', data.task.name);
                setValue('description', data.task.description);
                setValue('isActive', data.task.isActive);
                setValue('periodType', data.task.periodType);
                setValue('periodTypeTime', data.task.periodTypeTime);
                setValue('periodTypeWeekDays', data.task.periodTypeWeekDays);
                setValue('categoryName', data.task.category.name);
                setValue(
                    'periodTypeMonthDaysRadio',
                    data.task.periodTypeMonthDays && data.task.periodTypeMonthDays[0] ? data.task.periodTypeMonthDays[0] : null
                );
                setValue(
                    'periodTypeMonthsRadio',
                    data.task.periodTypeMonths && data.task.periodTypeMonths[0] ? data.task.periodTypeMonths[0] : null
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
                    data.task.periodType !== periodTypeState
                ) {
                    setPeriodTypeState(data.task.periodType);
                }

                parseAndSetPeriodTypeTime(data.task.periodTypeTime);

                setTextAreaAutoHeight(document.getElementById('inputDescription'));

                createTooltips();
            }
        }
    });
    const [loadCategoryNameOptions] = useLazyQuery(TASK_CATEGORIES_ALL, {
        onCompleted: (data) => {
            categoryNameOptions.current = data.taskCategoriesAll;
        }
    });
    const [updateTask, updatingTask] = useMutation(UPDATE_TASK, {
        onError: () => null,
    });
    const [deleteTask] = useMutation(DELETE_TASK, {
        onError: () => null,
    });
    const [createTask, creatingTask] = useMutation(CREATE_TASK, {
        onError: () => null,
    });
    useEffect(() => {
        if (taskId) {
            loadTask();
        } else {
            setValue('isActive', true);
            parseAndSetPeriodTypeTime('10:00');
            createTooltips();
        }

        return () => {
            tooltipObjectsList.current.map(t => t.dispose())
        }
    }, []);

    // combine separated time fields to one time value
    useEffect(() => {
        const periodTypeTimeString = periodTypeTimeHours
            + ':'
            + periodTypeTimeMinutes
            + (periodTypeTimeHasAmPm ? ' ' + periodTypeTimeAmPm : '');
        const periodTypeTimeFormat = periodTypeTimeHasAmPm ? 'h:mm a' : 'H:mm';
        const periodTypeTime24 = DateTime.fromFormat(periodTypeTimeString, periodTypeTimeFormat)
            .toFormat('HH:mm');

        if (periodTypeTime24) {
            setValue(
                'periodTypeTime',
                periodTypeTime24
            );
        }
    }, [periodTypeTimeHours, periodTypeTimeMinutes, periodTypeTimeAmPm]);

    const breadCrumbsPathArray = updateBreadCrumbsPathArray(
        1,
        {name: loadingTask.data?.task?.name ?? t('Create')},
        useMakePathArray()
    );

    const createTooltips = useCallback(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        // @ts-ignore
        tooltipObjectsList.current = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
    }, []);

    const setTextAreaAutoHeight = useCallback((target: any) => {
        // @ts-ignore
        target.style.height = "";
        // @ts-ignore
        target.style.height = (target.scrollHeight + 3) + "px";
    }, []);

    const parseAndSetPeriodTypeTime = useCallback((taskPeriodTypeTime: string) => {
        const periodTypeTimeObject = DateTime.fromFormat(taskPeriodTypeTime, 'HH:mm');
        const timeSimple = periodTypeTimeObject.toLocaleString(DateTime.TIME_SIMPLE);
        const timeSimpleArray = timeSimple.match(/^(\d+)\:(\d+)(?: ?(am|pm))?$/i);
        if (timeSimpleArray) {
            setPeriodTypeTimeHours(timeSimpleArray[1]);
            setPeriodTypeTimeMinutes(timeSimpleArray[2]);
            setPeriodTypeTimeAmPm(timeSimpleArray[3]?.toUpperCase());
            setPeriodTypeTimeHasAmPm(!!timeSimpleArray[3]);
        }
    }, []);

    const validatePeriodTypeTimeOnChange = useCallback((timeString: string, max: number = 59, min: number = 0, prependZero: boolean = true) => {
        // 5 -> 05
        if (prependZero && timeString.length == 1) {
            return '0' + timeString;
        }

        // 05 -> 5
        if (!prependZero && timeString.substring(0, 1) === '0' && timeString.length > 1) {
            return timeString.substring(1);
        }

        // when you have 02, after you type 8 -> 28
        if (
            timeString.length == (max.toString().length + 1) && timeString.substring(0, 1) === '0'
            || timeString.length > max.toString().length && parseInt(timeString) > max
        ) {
            let substringPlus1 = timeString.substring(1, max.toString().length + 1);
            // when you have 08, after you type 8 -> 08, because max is 59
            if (parseInt(substringPlus1) > max) {
                return max.toString();
            }
            // when you have 02, after you type 8 -> 28
            return substringPlus1;
        }

        // 123 -> 12 - only 2 digit allowed
        if (timeString.length > max.toString().length) {
            return timeString.substring(0, max.toString().length);
        }

        // fill empty string with zero
        if (timeString.length == 0) {
            if (prependZero) {
                return '00';
            } else {
                return '0';
            }
        }

        return timeString;
    }, []);

    if (loadingTask.loading) {
        return <Loading/>;
    } else if (loadingTask.error) {
        return <LoadingError/>;
    } else if (taskId && loadingTask.data?.task === null) {
        return <Error404/>;
    }

    const buttonLoading = updatingTask.loading || creatingTask.loading;

    async function onSubmit(data: TaskFormValuesType) {
        let variables: TaskFormValuesType & {
            id: String | undefined
        } = {
            id: taskId,
            name: data.name,
            description: data.description,
            periodType: data.periodType,
            periodTypeTime: data.periodTypeTime,
            isActive: data.isActive,
            categoryName: data.categoryName,
            periodTypeWeekDays: null,
            periodTypeMonthDays: null,
            periodTypeMonths: null,
        };
        if (data.periodType === 'Weekly') {
            variables = {
                ...variables,
                periodTypeWeekDays: data.periodTypeWeekDays,
            };
        }
        if (['Monthly', 'Yearly'].includes(data.periodType)) {
            variables = {
                ...variables,
                periodTypeMonthDays: data.periodTypeMonthDaysCheckbox || null,
            };
        }
        if (data.periodType === 'Yearly') {
            variables = {
                ...variables,
                periodTypeMonths: data.periodTypeMonthsCheckbox || null,
            };
        }
        // radio buttons
        if (data.periodType === 'Once') {
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
    for (let i = 1; i <= 31; i++) {
        periodTypeMonthDaysArray.push(i.toString());
    }

    return (
        <>
            <BreadCrumbs breadCrumbsPathArray={breadCrumbsPathArray}/>
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-md-6">
                        <h2>{t('Task details')}</h2>
                        <div className="mb-3">
                            <label
                                htmlFor="inputName"
                                className="htmlForm-label"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                data-bs-title="Give a name for you task"
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
                                onInput={(event) => setTextAreaAutoHeight(event.target)}
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
                                        e.target.checked
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
                            <label
                                htmlFor="inputCategoryName"
                                className="htmlForm-label"
                            >
                                {t('Category')} <span>({t('Optional').toLowerCase()})</span>
                            </label>
                            <input
                                type="text"
                                className={
                                    'form-control ' +
                                    (errors.categoryName ? 'is-invalid' : '')
                                }
                                id="inputCategoryName"
                                list="inputCategoryNameOptions"
                                placeholder={t('No category')}
                                autoComplete="off"
                                {...register('categoryName')}
                                onChange={(e) => {
                                    const prevValue = getValues('categoryName');
                                    setValue(
                                        'categoryName',
                                        e.target.value
                                    );
                                    if (e.target.value.length > 2 && e.target.value !== prevValue) {
                                        loadCategoryNameOptions({variables: {name: '%' + e.target.value + '%'}});
                                    }
                                }}
                            />
                            <datalist id="inputCategoryNameOptions">
                                {categoryNameOptions.current.map((option: any) => {
                                    return (<option key={option?.slug} value={option?.name}/>);
                                })}
                            </datalist>
                        </div>
                        <div className="text-start d-none d-md-block">
                            <SaveButton
                                buttonLoading={buttonLoading}
                                showRemoveBtn={!!taskId}
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
                                        setPeriodTypeState(e.target.value);
                                    },
                                })}
                            >
                                <option disabled>{t('Select period')}</option>
                                <option value="Daily">{t('Daily')}</option>
                                <option value="Weekly">{t('Weekly')}</option>
                                <option value="Monthly">{t('Monthly')}</option>
                                <option value="Yearly">{t('Yearly')}</option>
                                <option value="Once">{t('Once')}</option>
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
                                <div className="mb-3 g-3">
                                    <div className="d-inline-block mx-1">
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{maxWidth: '80px'}}
                                            placeholder="Hour"
                                            aria-label="Hour"
                                            min="0"
                                            max={periodTypeTimeHasAmPm ? 12 : 24}
                                            value={periodTypeTimeHours}
                                            onChange={(e) => {
                                                let hoursValue = e.target.value;
                                                if (periodTypeTimeHasAmPm && e.target.value.length === 0) {
                                                    hoursValue = '12';
                                                }
                                                setPeriodTypeTimeHours(validatePeriodTypeTimeOnChange(hoursValue, periodTypeTimeHasAmPm ? 12 : 24, 0, false));
                                            }}
                                        />
                                    </div>
                                    <div className="d-inline-block mx-1">
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{maxWidth: '80px'}}
                                            placeholder="Minute"
                                            aria-label="Minute"
                                            min="0"
                                            max="59"
                                            value={periodTypeTimeMinutes}
                                            onChange={(e) => {
                                                setPeriodTypeTimeMinutes(validatePeriodTypeTimeOnChange(e.target.value));
                                            }}
                                        />
                                    </div>
                                    {periodTypeTimeHasAmPm && (
                                        <div className="d-inline-block mx-1">
                                            <select
                                                className="form-control form-select"
                                                style={{maxWidth: '90px'}}
                                                aria-label="Default select example"
                                                value={periodTypeTimeAmPm}
                                                onChange={(e) => {
                                                    setPeriodTypeTimeAmPm(e.target.value);
                                                }}
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {periodTypeState === 'Weekly' ? (
                                <div
                                    className={
                                        'periodTypeWeekDaysC' +
                                        (periodTypeState !== 'Weekly' ? ' d-none' : '')
                                    }
                                >
                                    <label className="htmlForm-label">{t('Day of week')}</label>
                                    <div className="mb-3">
                                        {periodTypeWeekDaysArray.map(
                                            (weekDay, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline task-date-checkbox-size"
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
                            {['Monthly', 'Yearly'].includes(periodTypeState) ? (
                                <div className="periodTypeMonthDaysC">
                                    <label className="htmlForm-label">{t('Day of month')}</label>
                                    <div className="mb-3">
                                        {periodTypeMonthDaysArray.map(
                                            (monthDay, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline task-date-checkbox-size"
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
                            {periodTypeState === 'Yearly' ? (
                                <div className="periodTypeDiv4">
                                    <label className="htmlForm-label">{t('Month')}</label>
                                    <div className="mb-3">
                                        {periodTypeMonthsArray.map(
                                            (month, i) => {
                                                return (
                                                    <div
                                                        className="form-check form-check-inline task-month-checkbox-size"
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

                            {periodTypeState === 'Once' ? (
                                <>
                                    <div className="periodTypeMonthDaysC">
                                        <label className="htmlForm-label">{t('Day of month')}</label>
                                        <div className="mb-3">
                                            {periodTypeMonthDaysArray.map(
                                                (monthDay, i) => {
                                                    return (
                                                        <div
                                                            className="form-check form-check-inline task-date-checkbox-size"
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
                                        <label className="htmlForm-label">{t('Month')}</label>
                                        <div className="mb-3">
                                            {periodTypeMonthsArray.map(
                                                (month, i) => {
                                                    return (
                                                        <div
                                                            className="form-check form-check-inline task-month-checkbox-size"
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
                            showRemoveBtn={!!taskId}
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
