import { useContext, useEffect } from 'react';
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE } from '../../graphql/queries';
import { ApiGraphQLValidationError } from '../../types/ApiGraphQLErrorsErrors';
import { useLanguage } from '../../languages';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';

type ProfileFormValuesType = {
    name: string;
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
    const { language, setLanguage } = useContext(LanguageContext);

    const [saveProfile, savedProfile] = useMutation(UPDATE_PROFILE, {
        onError: () => null,
    });
    const t = useLanguage();
    useEffect(() => {
        setValue('name', currentUser?.name ?? '');
    }, []);

    async function onSubmit(data: ProfileFormValuesType) {
        let variables: ProfileFormValuesType = {
            name: data.name,
        };
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

    const languageChangeHandler = (languageValue: string) => {
        localStorage.setItem(
            process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'language',
            languageValue
        );
        setLanguage(languageValue);
    };

    return (
        <>
            <h1>{t('Profile')}</h1>
            <div className="mb-3">
                <div className="topLangMenuDropdown_cont">
                    <label htmlFor="language" className="form-label">
                        {t('Language')}
                    </label>
                    <select
                        className="form-select form-control"
                        aria-label="Default select example"
                        onChange={(e) => {
                            languageChangeHandler(e.target.value);
                        }}
                        value={language}
                    >
                        <option value="en">English</option>
                        <option value="ua">Українська</option>
                        <option value="ru">Русский</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
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
