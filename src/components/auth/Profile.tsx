import { useContext, useEffect } from 'react';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE } from '../../graphql/queries';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';

type ProfileFormValuesType = {
    email: string;
    name: string;
};

export default function Profile() {
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

    useEffect(() => {
        setValue('name', currentUser?.name ?? '');
        setValue('email', currentUser?.email ?? '');
    }, []);

    async function onSubmit(data: ProfileFormValuesType) {
        const responseData = await saveProfile({
            variables: {
                id: currentUser?.id,
                email: data.email,
                name: data.name,
            },
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

    return (
        <>
            <h1>Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Name
                    </label>
                    <input
                        type="name"
                        className={
                            'form-control ' + (errors.name && 'is-invalid')
                        }
                        id="name"
                        placeholder=""
                        {...register('name', {
                            required: 'Name is required.',
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors.name && errors.name.message}
                    </p>
                </div>
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
                    <p className="invalid-feedback">
                        {errors.email && errors.email.message}
                    </p>
                </div>
                {/* <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        className={
                            "form-control " + (errors.password && "is-invalid")
                        }
                        id="password"
                        placeholder="Your password"
                        {...register("password", {
                            required: "Password is required.",
                        })}
                    />
                    <p className="invalid-feedback">
                        {errors.password && errors.password.message}
                    </p>
                </div> */}
                <div className="col-auto">
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
                                &nbsp; Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
