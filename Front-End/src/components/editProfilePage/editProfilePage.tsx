import React, { useContext, useState } from 'react';
import {
    Form,
    Label,
    Input,
    Button,
    Message,
    InputOnChangeData,
} from 'semantic-ui-react';
import DeleteAccountModal from './deleteAccountModal/deleteAccountModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import { LoginSessionContext } from '@/context/LoginSessionContext';

export default function EditProfilePage() {
    const context = useContext(LoginSessionContext);
    const { updateUserInfo, clearSession } = context;
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [userParams, setUserParams] = useState({
        ...userInfo,
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

    const handleDeleteAccount = () => {
        PrimeShineAPIClient.deleteUser(userInfo.userID, userInfo.token)
            .then((didSucceed) => {
                if (!didSucceed) {
                    throw new Error('Could not delete user.');
                }

                clearSession();
                navigate('/', {
                    replace: true,
                });
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    const handleFormChange = (
        _: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
    ) => {
        const { name, value } = data;
        setUserParams({
            ...userParams,
            [name]: value,
        });
    };

    const isFormValid = () => {
        const { name, email, password } = userParams;

        return (
            name && name.length > 0 &&
            email && email.length > 0 &&
            password && password.length > 0
        );
    };

    return (
        <div className='flex flex-col mx-auto w-1/2'>
            <h1>{t('Edit Profile')}</h1>
            <div className='my-8'>
                <h3>
                    {t('Name')}: {userInfo.name}
                </h3>
                <h3>
                    {t('Email')}: {userInfo.email}
                </h3>
            </div>
            <Form>
                <Form.Field>
                    <Label>{t('Name')}:</Label>
                    <Input
                        type='text'
                        name='name'
                        defaultValue={userInfo.name}
                        onChange={handleFormChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Label>{t('Email')}:</Label>
                    <Input
                        type='text'
                        name='email'
                        defaultValue={userInfo.email}
                        onChange={handleFormChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Label>{t('Password')}:</Label>
                    <Input
                        type='password'
                        name='password'
                        onChange={handleFormChange}
                    />
                </Form.Field>
            </Form>
            <div className='flex flex-row gap-2 mt-4'>
                <Button
                    disabled={!isFormValid()}
                    onClick={() => handleUserEditProfile()}
                >
                    {t('Save Changes')}
                </Button>
                <DeleteAccountModal
                    trigger={<Button negative>{t('Delete Account')}</Button>}
                    onSubmit={() => handleDeleteAccount()}
                />
            </div>
            {error && <Message negative content={error} />}
        </div>
    );
}
