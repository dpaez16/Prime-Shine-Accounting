import React, {Component} from 'react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
//import './registerPage.css';

class RegisterPage extends Component {
    handleUserRegister() {
        const name = document.getElementById('RegisterPage_name').value;
        const email = document.getElementById('RegisterPage_email').value;
        const password = document.getElementById('RegisterPage_password').value;
        
        PrimeShineAPIClient.createUser(name, email, password)
        .then((user) => {
            this.props.navigation('/', {
                replace: true
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    render() {
        const {t} = this.props;
        return (
            <div className="RegisterPage">
                <form>
                    <label htmlFor="RegisterPage_name">{t('Name')}:</label>&nbsp;&nbsp;
                    <input type="text" id="RegisterPage_name" />
                    <br />
                    <label htmlFor="RegisterPage_email">{t('Email')}:</label>&nbsp;&nbsp;
                    <input type="text" id="RegisterPage_email" />
                    <br />
                    <label htmlFor="RegisterPage_password">{t('Password')}:</label>&nbsp;&nbsp;
                    <input type="password" id="RegisterPage_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();
                        this.handleUserRegister();
                    }}>
                        {t('Register')}
                    </button>
                </form>
            </div>
        );
    }
};

export default componentWrapper(RegisterPage);