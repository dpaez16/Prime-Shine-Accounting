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
            alert("User is created!");
            this.props.navigation('/');
        })
        .catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div className="RegisterPage">
                <form>
                    <label htmlFor="RegisterPage_name">Name:</label>&nbsp;&nbsp;
                    <input type="text" id="RegisterPage_name" />
                    <br />
                    <label htmlFor="RegisterPage_email">Email:</label>&nbsp;&nbsp;
                    <input type="text" id="RegisterPage_email" />
                    <br />
                    <label htmlFor="RegisterPage_password">Password:</label>&nbsp;&nbsp;
                    <input type="password" id="RegisterPage_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();
                        this.handleUserRegister();
                    }}>
                        Register
                    </button>
                </form>
            </div>
        );
    }
};

export default componentWrapper(RegisterPage);