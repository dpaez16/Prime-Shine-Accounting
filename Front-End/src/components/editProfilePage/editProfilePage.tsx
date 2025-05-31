import React, { useContext, useState } from 'react';
import { DeleteAccountModal } from './modals/deleteAccountModal';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import useLocalization from '@/hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { PageTitle } from '@/components/ui/page-title';

export const EditProfilePage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const { updateUserInfo } = context;
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const navigate = useNavigate();

    const [error, setError] = useState<Error | null>(null);
    const [userParams, setUserParams] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleUserEditProfile = () => {
        const { name, email, password } = userParams;
        const userId = userInfo.userID;
        const token = userInfo.token;

        PrimeShineAPIClient.editUser(name, email, password, userId, token)
            .then((user) => {
                updateUserInfo({ ...userInfo, ...user });
                navigate(-1);
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    const handleFormChange = (name: string, value: string) => {
        setUserParams({
            ...userParams,
            [name]: value,
        });
    };

    const isFormValid = () => {
        const { name, email, password } = userParams;
        return !!name && !!email && !!password;
    };

    return (
        <div className='flex flex-col mx-auto w-1/2'>
            <PageTitle>{t('Edit Profile')}</PageTitle>
            <div className='my-8'>
                <h3>
                    {t('Name')}: {userInfo.name}
                </h3>
                <h3>
                    {t('Email')}: {userInfo.email}
                </h3>
            </div>
            <GridForm>
                <GridFormItem label={t('Name')}>
                    <Input
                        name='name'
                        value={userParams.name}
                        onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    />
                </GridFormItem>
                <GridFormItem label={t('Email')}>
                    <Input
                        name='email'
                        value={userParams.email}
                        onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    />
                </GridFormItem>
                <GridFormItem label={t('Password')}>
                    <Input
                        name='password'
                        type='password'
                        value={userParams.password}
                        onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    />
                </GridFormItem>
            </GridForm>
            <div className='flex flex-row gap-2 mt-4'>
                <Button
                    disabled={!isFormValid()}
                    onClick={() => handleUserEditProfile()}
                >
                    {t('Save Changes')}
                </Button>
                <DeleteAccountModal />
            </div>
            <ErrorMessage message={error?.message} />
        </div>
    );
};