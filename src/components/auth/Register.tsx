import { useContext } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { USER_REGISTRATION, CREATE_USER_DEVICE } from '../../graphql/queries';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from './../../context/CurrentUserContext';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';
import { useLanguage } from '../../languages';

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
    const t = useLanguage();

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
            <h1>{t('Registration')}</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        {t('Email')}
                    </label>
                    <input
                        type="email"
                        className={
                            'form-control ' + (errors.email && 'is-invalid')
                        }
                        id="email"
                        placeholder="name@example.com"
                        {...register('email', {
                            required: t('Email is required'),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t('Invalid email address'),
                            },
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors?.email && t(errors?.email?.message as string)}
                    </p>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        {t('Password')}
                    </label>
                    <div className="position-relative passwordEye">
                        <input
                            type="password"
                            className={
                                'form-control ' +
                                (errors.password && 'is-invalid')
                            }
                            id="password"
                            placeholder={t('Your password')}
                            {...register('password', {
                                required: t('Password is required'),
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
                            {errors?.password &&
                                t(errors?.password?.message as string)}
                        </p>
                    </div>
                </div>
                <div className="mb-3">
                    <label
                        htmlFor="password_confirmation"
                        className="form-label"
                    >
                        {t('Password confirmation')}
                    </label>
                    <input
                        type="password"
                        className={
                            'form-control ' +
                            (errors.password_confirmation && 'is-invalid')
                        }
                        id="password_confirmation"
                        placeholder={t('Just type the same password')}
                        {...register('password_confirmation', {
                            required: t('Password confirmation is required'),
                        })}
                    />

                    <p className="invalid-feedback">
                        {errors?.password_confirmation &&
                            t(errors?.password_confirmation?.message as string)}
                    </p>
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        {t('Your name (optional)')}
                    </label>
                    <input
                        type="name"
                        className={
                            'form-control ' + (errors.name && 'is-invalid')
                        }
                        id="name"
                        placeholder={t('Karl')}
                        {...register('name')}
                    />
                    <p className="invalid-feedback">
                        {errors?.name && t(errors?.name?.message as string)}
                    </p>
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
                                &nbsp; {t('Registering')} ...
                            </>
                        ) : (
                            t('Submit')
                        )}
                    </button>
                </div>
            </form>
            <div className="loginOrRegister">
                <i className="bi bi-person-fill"></i>
                {t(' If you have an account ')}
                <a
                    className=""
                    title="Edit"
                    href="/login"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../login');
                    }}
                >
                    {t('login')}
                </a>
            </div>
        </>
    );
}
