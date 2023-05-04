import React, {Component} from 'react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import WaveAPIClient from '../../api/waveApiClient';
import componentWrapper from '../../utils/componentWrapper';
//import './loginPage.css';

class LoginPage extends Component {
    handleUserLogin() {
        const email = document.getElementById('LoginPage_email').value;
        const password = document.getElementById('LoginPage_password').value;
        
        PrimeShineAPIClient.loginUser(email, password)
        .then((user) => {
            return WaveAPIClient.fetchBusinessData()
            .then((businessInfo) => {
                this.props.updateUserInfo(user);
                this.props.updateBusinessInfo(businessInfo);
                this.props.navigation('/', {
                    replace: true
                });
            })
            .catch(err => {
                throw err
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    render() {
        const {t} = this.props;
        return (
            <div className="LoginPage">
                <form>
                    <label htmlFor="LoginPage_email">{t('Email')}:</label>&nbsp;&nbsp;
                    <input type="text" id="LoginPage_email" />
                    <br />
                    <label htmlFor="LoginPage_password">{t('Password')}:</label>&nbsp;&nbsp;
                    <input type="password" id="LoginPage_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();
                        this.handleUserLogin();
                    }}>
                        {t('Login')}
                    </button>
                </form>
            </div>
        );
    }
};

export default componentWrapper(LoginPage);