import { useContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { LOGIN } from '../../graphql/queries';
import { useLocation, useNavigate } from 'react-router-dom';
import { CurrentUserContext } from './../../context/CurrentUserContext';
import { useLanguage } from '../../languages';

type LocationStateType = {
    referer: {
        pathname: string;
    };
};

type FormValuesType = {
    email: string;
    password: string;
};

export default function Login() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValuesType>();

    const [login, logged] = useMutation(LOGIN, {
        onError: () => null,
    });
    const t = useLanguage();
    const location = useLocation();
    const locationState = location.state as LocationStateType;

    const navigate = useNavigate();

    // if user logged in for the first place redirect to main page
    useEffect(() => {
        if (currentUser)
            navigate('/', {
                replace: true,
            });
    }, []);

    async function onSubmit(data: FormValuesType) {
        const responseData = await login({
            variables: {
                email: data.email,
                password: data.password,
            },
        });

        if (responseData && responseData.data && responseData.data.login) {
            localStorage.setItem(
                process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token',
                responseData.data.login.token
            );
            setCurrentUser(responseData.data.login.user);

            let redirectTo = '/';
            if (locationState?.referer?.pathname)
                redirectTo = locationState.referer.pathname;

            navigate(redirectTo, {
                replace: true,
            });
        } else if (responseData.errors) {
            const responseDataErrors: any = responseData.errors;
            setError('email', {
                type: 'custom',
                message: '',
            });
            setError('password', {
                type: 'custom',
                message: responseDataErrors.message ?? 'Unexpected error',
            });
        }
    }

    return (
        <>
            <h1>{t('Sign in')}</h1>
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
                            required: 'Email is required.',
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
                    <input
                        type="password"
                        className={
                            'form-control ' + (errors.password && 'is-invalid')
                        }
                        id="password"
                        placeholder={t('Your password')}
                        {...register('password', {
                            required: t('Password is required'),
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors?.password &&
                            t(errors?.password?.message as string)}
                    </p>
                </div>
                <div className="col-auto">
                    <button
                        type="submit"
                        className="btn btn-primary mb-3"
                        disabled={logged.loading ? true : false}
                    >
                        {logged.loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                &nbsp; {t('Logging in')}...
                            </>
                        ) : (
                            t('Submit')
                        )}
                    </button>
                </div>
            </form>
            <div className="loginOrRegister">
                <i className="bi bi-person-fill"></i> {t('Create a ')}
                <a
                    className=""
                    title="Edit"
                    href="/register"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('../register');
                    }}
                >
                    {t('new account')}
                </a>
                {t(' if you are new')}
            </div>
        </>
    );
}
