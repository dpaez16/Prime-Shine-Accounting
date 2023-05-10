import React, {Component} from 'react';
import {Container, Header, Form, Label, Input, Button, Message, Divider} from 'semantic-ui-react';
import DeleteAccountModal from './deleteAccountModal/deleteAccountModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
import './editProfilePage.css';

class EditProfilePage extends Component {
    constructor(props) {
        super(props);

        const userInfo = this.props.userInfo;
        this.state = {
            error: null,
            name: userInfo.name,
            email: userInfo.email,
            password: null
        };
    }

    handleUserEditProfile() {
        const { name, email, password } = this.state;
        const userId = this.props.userInfo._id;
        const token = this.props.userInfo.token;

        PrimeShineAPIClient.editUser(name, email, password, userId, token)
        .then((user) => {
            this.props.updateUserInfo(user);
            this.props.navigation(-1);
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    handleDeleteAccount() {
        PrimeShineAPIClient.deleteUser(this.props.userInfo._id, this.props.userInfo.token)
        .then(didSucceed => {
            this.props.updateUserInfo(null);
            this.props.updateBusinessInfo(null);
            this.props.navigation("/", {
                replace: true
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    handleFormChange(event, {name, value}) {
        this.setState({
            [name]: value
        });
    }

    isFormValid() {
        const { name, email, password } = this.state;

        return (
            name && name.length > 0 &&
            email && email.length > 0 &&
            password && password.length > 0
        );
    }
    
    render() {
        const {t, userInfo} = this.props;

        return (
            <Container className="EditProfilePage">
                <Header as='h1'>{t('Edit Profile')}</Header>
                {
                    this.state.error &&
                    <Message
                        negative
                        content={this.state.error}
                    />
                }
                <Container className="EditProfilePage_currentProfile">
                    <Header as='h3'>{t('Name')}: {userInfo.name}</Header>
                    <Header as='h3'>{t('Email')}: {userInfo.email}</Header>
                </Container>
                <Divider hidden />
                <Form>
                    <Form.Field>
                        <Label>{t('Name')}:</Label>
                        <Input
                            type="text"
                            name="name"
                            defaultValue={userInfo.name}
                            onChange={this.handleFormChange.bind(this)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Email')}:</Label>
                        <Input
                            type="text"
                            name="email"
                            defaultValue={userInfo.email}
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
                <Container fluid className="EditProfilePage_buttons">
                    <Button
                        disabled={!this.isFormValid()}
                        onClick={() => this.handleUserEditProfile()}
                    >
                        {t('Save Changes')}
                    </Button>
                    <DeleteAccountModal
                        trigger={<Button negative>{t('Delete Account')}</Button>}
                        onSubmit={() => this.handleDeleteAccount()}
                    />
                </Container>
            </Container>
        );
    }
};

export default componentWrapper(EditProfilePage);