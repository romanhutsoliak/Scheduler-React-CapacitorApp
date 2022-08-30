import { useContext } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { USER_REGISTRATION, CREATE_USER_DEVICE } from '../../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from './../../context/CurrentUserContext';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';

type FormValuesType = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { setCurrentUser } = useContext(CurrentUserContext);
    const [createUserDevice] = useMutation(CREATE_USER_DEVICE, {
        onError: () => null,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValuesType>();

    const [registration, registered] = useMutation(USER_REGISTRATION, {
        onError: () => null,
    });

    const navigate = useNavigate();

    async function onSubmit(data: FormValuesType) {
        const responseData = await registration({
            variables: {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            },
        });

        if (
            responseData &&
            responseData.data &&
            responseData.data.userRegistration
        ) {
            localStorage.setItem(
                process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token',
                responseData.data.userRegistration.token
            );
            setCurrentUser(responseData.data.userRegistration.user);

            if (window.userDevice?.deviceId) {
                createUserDevice({
                    variables: {
                        deviceId: window.userDevice.deviceId,
                        platform: window.userDevice.platform,
                        manufacturer: window.userDevice.manufacturer,
                        model: window.userDevice.model,
                        appVersion: window.userDevice.appVersion,
                        notificationToken: window.userDevice.notificationToken,
                    },
                });
            }

            navigate('/', {
                replace: true,
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
            <h1>Registration</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email address
                    </label>
                    <input
                        type="email"
                        className={
                            'form-control ' + (errors.email && 'is-invalid')
                        }
                        id="email"
                        placeholder="name@example.com"
                        {...register('email', {
                            required: 'Email is required.',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                    />
                    <p className="invalid-feedback">{errors?.email?.message}</p>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <div className="position-relative passwordEye">
                        <input
                            type="password"
                            className={
                                'form-control ' +
                                (errors.password && 'is-invalid')
                            }
                            id="password"
                            placeholder="Your password"
                            {...register('password', {
                                required: 'Password is required.',
                            })}
                        />
                        <i
                            className="passwordEye_i bi bi-eye"
                            onClick={(e) => {
                                const passwordInput = (
                                    e.target as HTMLTextAreaElement
                                ).previousSibling as HTMLTextAreaElement;
                                const passwordConfirmationInput =
                                    document.getElementById(
                                        'password_confirmation'
                                    ) as HTMLTextAreaElement;
                                if (passwordInput) {
                                    passwordInput.setAttribute(
                                        'type',
                                        passwordInput.type == 'text'
                                            ? 'password'
                                            : 'text'
                                    );
                                }
                                if (passwordConfirmationInput) {
                                    passwordConfirmationInput.setAttribute(
                                        'type',
                                        passwordConfirmationInput.type == 'text'
                                            ? 'password'
                                            : 'text'
                                    );
                                }
                            }}
                        ></i>
                        <p className="invalid-feedback">
                            {errors?.password?.message}
                        </p>
                    </div>
                </div>
                <div className="mb-3">
                    <label
                        htmlFor="password_confirmation"
                        className="form-label"
                    >
                        Password confirmation
                    </label>
                    <input
                        type="password"
                        className={
                            'form-control ' +
                            (errors.password_confirmation && 'is-invalid')
                        }
                        id="password_confirmation"
                        placeholder="Just type the same password"
                        {...register('password_confirmation', {
                            required: 'Password confirmation is required.',
                        })}
                    />

                    <p className="invalid-feedback">
                        {errors?.password_confirmation?.message}
                    </p>
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Your name (optional)
                    </label>
                    <input
                        type="name"
                        className={
                            'form-control ' + (errors.name && 'is-invalid')
                        }
                        id="name"
                        placeholder="Karl Carson"
                        {...register('name')}
                    />
                    <p className="invalid-feedback">{errors?.name?.message}</p>
                </div>
                <div className="col-auto">
                    <button
                        type="submit"
                        className="btn btn-primary mb-3"
                        disabled={registered.loading ? true : false}
                    >
                        {registered.loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                &nbsp; Registering ...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </form>
            <div className="loginOrRegister">
                <i className="bi bi-person-fill"></i> If you have an account{' '}
                <a
                    className=""
                    title="Edit"
                    href="/login"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../login');
                    }}
                >
                    login
                </a>
            </div>
        </>
    );
}
