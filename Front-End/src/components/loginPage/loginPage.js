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
                this.props.navigation('/');
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
        return (
            <div className="LoginPage">
                <form>
                    <label htmlFor="LoginPage_email">Email:</label>&nbsp;&nbsp;
                    <input type="text" id="LoginPage_email" />
                    <br />
                    <label htmlFor="LoginPage_password">Password:</label>&nbsp;&nbsp;
                    <input type="password" id="LoginPage_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();
                        this.handleUserLogin();
                    }}>
                        Login
                    </button>
                </form>
            </div>
        );
    }
};

export default componentWrapper(LoginPage);