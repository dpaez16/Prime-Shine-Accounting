import React, { useContext, useState } from 'react';
import { Modal, Button, Form, Label, Input, Message } from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import WaveAPIClient from '../../api/waveApiClient';
import useLocalization from '../../hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';

type LoginModalProps = {
    trigger: React.ReactElement;
};

type UserParams = {
    email: string;
    password: string;
};

export default function LoginModal(props: LoginModalProps) {
    const { updateUserInfo, updateBusinessInfo } = useContext(LoginSessionContext);
    const [userParams, setUserParams] = useState({} as UserParams);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useLocalization();

    const handleUserLogin = () => {
        const { email, password } = userParams;
        setError(null);

        return PrimeShineAPIClient.loginUser(email, password)
            .then((user) => {
                return WaveAPIClient.fetchBusinessData()
                    .then((businessInfo) => {
                        return { user: user, businessInfo: businessInfo };
                    })
                    .catch((err) => {
                        throw err;
                    });
            })
            .catch((err) => {
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
        const { email, password } = userParams;
        return email && email.length > 0 && password && password.length > 0;
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
            <Modal.Header>{t('Login')}</Modal.Header>
            <Modal.Content>
                <Form>
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
                        handleUserLogin()
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
                    {t('Login')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
