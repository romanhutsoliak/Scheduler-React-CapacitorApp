import { useContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { LOGIN, CREATE_USER_DEVICE } from '../../graphql/queries';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CurrentUserContext,
    CurrentUserI,
} from './../../context/CurrentUserContext';
import { GraphQLError } from 'graphql';

type LocationStateType = {
    referer: {
        pathname: string;
    };
};

type loginMutationVariablesType = {
    email: string;
    password: string;
};
type loginMutationResponseDataType = {
    data?: {
        login: {
            token: string;
            user: CurrentUserI;
        };
    };
    errors?: ReadonlyArray<{
        message: string;
    }>;
};

type FormValuesType = {
    email: string;
    password: string;
};
type UseFormErrorsType = {
    errors: {
        name: { message: string };
        password: { message: string };
    };
};
type ApiResponseErrorsType = ReadonlyArray<GraphQLError> & {
    message: string;
};

export default function Login() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const [createUserDevice] = useMutation(CREATE_USER_DEVICE, {
        onError: () => null,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValuesType>();

    const [login, logged] = useMutation(LOGIN, {
        onError: () => null,
    });

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

            let redirectTo = '/';
            if (locationState.referer?.pathname)
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
            <h1>Sign in</h1>
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
                                message: 'invalid email address',
                            },
                        })}
                    />
                    <p className="invalid-feedback">{errors?.email?.message}</p>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        className={
                            'form-control ' + (errors.password && 'is-invalid')
                        }
                        id="password"
                        placeholder="Your password"
                        {...register('password', {
                            required: 'Password is required.',
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors?.password?.message}
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
                                &nbsp; Logging in...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
