import { useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../layoutParts/Loading';
import { QUERY_TASK, UPDATE_TASK, CREATE_TASK } from '../../graphql/queries';
import { useForm } from 'react-hook-form';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';

type TaskFormValuesType = {
    name: string;
    description: string;
};

export default function Task() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm<TaskFormValuesType>();
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [loadTask, loadingTask] = useLazyQuery(QUERY_TASK, {
        variables: { id: taskId },
        onCompleted: (data) => {
            setValue('name', data.task.name);
            setValue('description', data.task.description);
        },
    });
    const [updateTask, updatingTask] = useMutation(UPDATE_TASK, {
        onError: () => null,
    });
    const [createTask, creatingTask] = useMutation(CREATE_TASK, {
        onError: () => null,
    });
    useEffect(() => {
        loadTask();
    }, [taskId]);

    if (loadingTask.loading) return <Loading />;
    const buttonLoading = updatingTask.loading || creatingTask.loading;

    async function onSubmit(data: TaskFormValuesType) {
        let responseData = null;
        if (taskId) {
            responseData = await updateTask({
                variables: {
                    id: taskId,
                    name: data.name,
                    description: data.description,
                },
            });
        } else {
            responseData = await createTask({
                variables: {
                    name: data.name,
                    description: data.description,
                },
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

    return (
        <>
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="inputName" className="htmlForm-label">
                        Name
                    </label>
                    <input
                        type="name"
                        className={
                            'form-control ' + (errors.name && 'is-invalid')
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
                        {errors.description && errors.description.message}
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
            </form>
        </>
    );
}
