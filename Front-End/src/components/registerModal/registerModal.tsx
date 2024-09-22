import {useState} from 'react';
import {Form, Label, Input, Button, Message, Modal} from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import WaveAPIClient from '../../api/waveApiClient';
import useLocalization from '../../hooks/useLocalization';

export default function RegisterModal(props) {
    const [userParams, setUserParams] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [t] = useLocalization();

    const handleUserRegister = () => {
        const { name, email, password } = userParams;
        
        return PrimeShineAPIClient.createUser(name, email, password)
        .then((user) => {
            return WaveAPIClient.fetchBusinessData()
            .then((businessInfo) => {
                return {user: user, businessInfo: businessInfo};
            })
            .catch(err => {
                throw err
            });
        })
        .catch((err) => {
            throw err;
        });
    };

    const handleFormChange = (event, {name, value}) => {
        setUserParams({
            ...userParams,
            [name]: value
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
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Email')}:</Label>
                        <Input
                            type="text"
                            name="email"
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Password')}:</Label>
                        <Input
                            type="password"
                            name="password"
                            onChange={handleFormChange}
                        />
                    </Form.Field>
                </Form>
                {
                    error &&
                    <Message
                        negative
                        content={error}
                    />
                }
            </Modal.Content>
            <Modal.Actions>
                <Button 
                    color='black' 
                    onClick={() => setModalOpen(false)}
                >
                    {t('Cancel')}
                </Button>
                <Button 
                    onClick={() => {
                        handleUserRegister()
                        .then(({user, businessInfo}) => {
                            props.updateUserInfo(user);
                            props.updateBusinessInfo(businessInfo);
                            setModalOpen(false);
                        })
                        .catch(err => {
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
};