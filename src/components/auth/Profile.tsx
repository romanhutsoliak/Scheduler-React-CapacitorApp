import { useContext, useEffect } from 'react';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE } from '../../graphql/queries';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';
import { useLanguage } from '../../languages';
import { useNavigate } from 'react-router-dom';

type ProfileFormValuesType = {
    email: string;
    name: string;
    password?: string;
    password_confirmation?: string;
};

export default function Profile() {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm<ProfileFormValuesType>();

    const [saveProfile, savedProfile] = useMutation(UPDATE_PROFILE, {
        onError: () => null,
    });
    const t = useLanguage();
    useEffect(() => {
        setValue('name', currentUser?.name ?? '');
        setValue('email', currentUser?.email ?? '');
    }, []);

    async function onSubmit(data: ProfileFormValuesType) {
        // if password is filled compare them
        if (data.password || data.password_confirmation) {
            if (!data.password) {
                setError('password', {
                    type: 'custom',
                    message: t('Password is required'),
                });
                return false;
            } else if (!data.password_confirmation) {
                setError('password_confirmation', {
                    type: 'custom',
                    message: t('Password confirmation is required'),
                });
                return false;
            } else if (data.password != data.password_confirmation) {
                setError('password', {
                    type: 'custom',
                    message: t("Password and confirmation don't match"),
                });
                return false;
            }
        }
        let variables: ProfileFormValuesType = {
            email: data.email,
            name: data.name,
        };
        if (data.password) {
            variables = {
                ...variables,
                password: data.password,
                password_confirmation: data.password_confirmation,
            };
        }
        const responseData = await saveProfile({
            variables: variables,
        });

        if (responseData?.data?.updateProfile) {
            setCurrentUser(responseData.data.updateProfile);
        } else if (responseData.errors) {
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
    console.log(errors);

    return (
        <>
            <h1>{t('Profile')}</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        {t('Email')}
                    </label>
                    <input
                        type="email"
                        className={
                            'form-control ' + (errors.email ? 'is-invalid' : '')
                        }
                        id="email"
                        placeholder="name@example.com"
                        {...register('email', {
                            required: t('Email is required.'),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t('invalid email address'),
                            },
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors?.email && t(errors?.email?.message as string)}
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
                <h3>Change password</h3>
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
                            {...register('password')}
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
                            {errors.password && errors.password.message}
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
                        {...register('password_confirmation')}
                    />

                    <p className="invalid-feedback">
                        {errors?.password_confirmation &&
                            t(errors?.password_confirmation?.message as string)}
                    </p>
                </div>
                <div className="col-auto">
                    {currentUser?.email && (
                        <div className="float-end">
                            <button
                                type="button"
                                className="btn btn-link mb-3 text-danger"
                                onClick={(e) => {
                                    e.preventDefault();

                                    if (window.confirm(t('Are you sure ?'))) {
                                        navigate('/logout');
                                    }
                                }}
                            >
                                {t('Logout')}
                            </button>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary mb-3"
                        disabled={savedProfile.loading ? true : false}
                    >
                        {savedProfile.loading ? (
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
                </div>
            </form>
        </>
    );
}
