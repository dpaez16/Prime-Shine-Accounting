import React, { useContext, useState } from 'react';
import { Form, Label, Input, Button, Message, Modal } from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';

type RegisterModalProps = {
    trigger: React.ReactElement;
};

type UserParams = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterModal(props: RegisterModalProps) {
    const { updateUserInfo, updateBusinessInfo } = useContext(LoginSessionContext);
    const [userParams, setUserParams] = useState({} as UserParams);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useLocalization();

    const handleUserRegister = () => {
        const { name, email, password } = userParams;

        return PrimeShineAPIClient.createUser(name, email, password)
            .then(data => {
                const { userInfo: user, businessInfo } = data;
                return { user: user, businessInfo: businessInfo };
            })
            .catch(err => {
                throw err;
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
        return (
            name && name.length > 0 &&
            email && email.length > 0 &&
            password && password.length > 0
        );
    };

    return (
        <Modal
            onClose={() => {
                setModalOpen(false);
                setError(null);
            }}
            onOpen={() => {
                setModalOpen(true);
                setError(null);
            }}
            open={modalOpen}
            trigger={props.trigger}
        >
            <Modal.Header>{t('Register')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Name')}:</Label>
                        <Input
                            type="text"
                            name="name"
                            onChange={(_, data) => handleFormChange(data.name, data.value)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Email')}:</Label>
                        <Input
                            type="text"
                            name="email"
                            onChange={(_, data) => handleFormChange(data.name, data.value)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Password')}:</Label>
                        <Input
                            type="password"
                            name="password"
                            onChange={(_, data) => handleFormChange(data.name, data.value)}
                        />
                    </Form.Field>
                </Form>
                {error && <Message negative content={error} />}
            </Modal.Content>
            <Modal.Actions>
                <Button
                    color="black"
                    onClick={() => setModalOpen(false)}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={() => {
                        handleUserRegister()
                            .then(data => {
                                const { user, businessInfo } = data;
                                updateUserInfo(user);
                                updateBusinessInfo(businessInfo);
                                setModalOpen(false);
                            })
                            .catch((err) => {
                                setError(err.message);
                            });
                    }}
                    disabled={!isFormValid()}
                    positive
                >
                    {t('Register')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
