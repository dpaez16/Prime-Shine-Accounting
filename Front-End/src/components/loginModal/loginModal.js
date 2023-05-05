import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Message} from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import WaveAPIClient from '../../api/waveApiClient';
import componentWrapper from '../../utils/componentWrapper';
//import './loginModal.css';

class LoginModal extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            modalOpen: false,
            error: null
        };
    }

    handleUserLogin() {
        const { email, password } = this.state;
        
        return PrimeShineAPIClient.loginUser(email, password)
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
    }

    handleFormChange(event, {name, value}) {
        this.setState({
            [name]: value
        });
    }
    
    isFormValid() {
        const { email, password } = this.state;
        return (
            email && email.length > 0 &&
            password && password.length > 0
        );
    }

    render() {
        const {t} = this.props;
        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false,
                    error: null
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    error: null
                })}
                open={this.state.modalOpen}
                trigger={this.props.trigger}
            >
                <Modal.Header>{t('Login')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Email')}:</Label>
                            <Input
                                type="text"
                                name="email"
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Password')}:</Label>
                            <Input
                                type="password"
                                name="password"
                                onChange={this.handleFormChange.bind(this)}
                            />
                        </Form.Field>
                    </Form>
                    {
                        this.state.error &&
                        <Message
                            negative
                            content={this.state.error}
                        />
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button 
                        color='black' 
                        onClick={() => this.setState({modalOpen: false})}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button 
                        onClick={() => {
                            this.handleUserLogin()
                            .then(({user, businessInfo}) => {
                                this.props.updateUserInfo(user);
                                this.props.updateBusinessInfo(businessInfo);
                                this.setState({modalOpen: false});
                            })
                            .catch(err => {
                                this.setState({
                                    error: err.message
                                });
                            });
                        }}
                        disabled={!this.isFormValid()}
                        positive
                    >
                            {t('Login')}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(LoginModal);