import React, { useContext, useState } from 'react';
import {
    Container,
    Header,
    Form,
    Label,
    Input,
    Button,
    Message,
    Divider,
    InputOnChangeData,
} from 'semantic-ui-react';
import DeleteAccountModal from './deleteAccountModal/deleteAccountModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import './editProfilePage.css';
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
        const userId = userInfo._id;
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
        PrimeShineAPIClient.deleteUser(userInfo._id, userInfo.token)
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
        <Container className='EditProfilePage'>
            <Header as='h1'>{t('Edit Profile')}</Header>
            {error && <Message negative content={error} />}
            <Container className='EditProfilePage_currentProfile'>
                <Header as='h3'>
                    {t('Name')}: {userInfo.name}
                </Header>
                <Header as='h3'>
                    {t('Email')}: {userInfo.email}
                </Header>
            </Container>
            <Divider hidden />
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
            <Container fluid className='EditProfilePage_buttons'>
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
            </Container>
        </Container>
    );
}
