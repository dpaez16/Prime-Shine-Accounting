import React, {Component} from 'react';
import LoginModal from '../loginModal/loginModal';
import RegisterModal from '../registerModal/registerModal';
import { Button } from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
//import './homePage.css';

class HomePage extends Component {
    handleDeleteAccount() {
        PrimeShineAPIClient.deleteUser(this.props.userInfo._id, this.props.userInfo.token)
        .then(didSucceed => {
            this.props.updateUserInfo(null);
            this.props.updateBusinessInfo(null);
        })
        .catch(err => console.log);
    }

    render() {
        const {t} = this.props;

        if (!this.props.userInfo) {
            return (
                <div className="HomePage">
                <ul>
                    <li>
                        <LoginModal
                            trigger={<Button>{t('Login')}</Button>}
                            updateUserInfo={this.props.updateUserInfo}
                            updateBusinessInfo={this.props.updateBusinessInfo}
                        />
                    </li>
                    <li>
                        <RegisterModal
                            trigger={<Button>{t('Register')}</Button>}
                            updateUserInfo={this.props.updateUserInfo}
                            updateBusinessInfo={this.props.updateBusinessInfo}
                        />
                    </li>
                </ul>
                </div>      
            );
        }

        return (
            <div className="HomePage">
                <p>Prime Shine Accounting:</p>
                <ul>
                    <li>ID: {this.props.userInfo._id}</li>
                    <li>Name: {this.props.userInfo.name}</li>
                    <li>Email: {this.props.userInfo.email}</li>
                    <li>JWT: {this.props.userInfo.token}</li>
                </ul>
                <p>Wave Apps:</p>
                <ul>
                    <li>Business ID: {this.props.businessInfo.businessId}</li>
                    <li>Business Name: {this.props.businessInfo.businessName}</li>
                    <li>Product ID: {this.props.businessInfo.productId}</li>
                    <li>Product Name: {this.props.businessInfo.productName}</li>
                </ul>  
                <p>Options:</p>              
                <ul>
                    <li>
                        <button onClick={e => {
                            e.preventDefault();

                            this.props.updateUserInfo(null);
                            this.props.updateBusinessInfo(null);
                            this.props.navigation('/');
                        }}>
                            Logout
                        </button>
                    </li>
                    <li>
                        <button onClick={e => {
                            e.preventDefault();

                            if (window.confirm("Delete account?")) {
                                this.handleDeleteAccount();
                            }
                        }}>
                            Delete Account
                        </button>
                    </li>
                    <li>
                        <button onClick={e => {
                            e.preventDefault();

                            this.props.navigation('/editProfile');
                        }}>
                            Edit Profile
                        </button>
                    </li>
                    <li>
                        <a
                            href="/schedules"
                            onClick={e => {
                                e.preventDefault(); 
                                this.props.navigation('/schedules');
                            }}
                        >
                            Schedules
                        </a>
                        
                    </li>
                    <li>
                        <a
                            href="/customers"
                            onClick={e => {
                                e.preventDefault(); 
                                this.props.navigation('/customers');
                            }}
                        >
                            Customers
                        </a>
                    </li>
                    <li>
                        <a
                            href="/invoices"
                            onClick={e => {
                                e.preventDefault(); 
                                this.props.navigation('/invoices');
                            }}
                        >
                            Invoices
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
};

export default componentWrapper(HomePage);