import React, {Component} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Container} from 'semantic-ui-react';
import HomePage from './components/homePage/homePage';
import LoginPage from './components/loginPage/loginPage';
import RegisterPage from './components/registerPage/registerPage';
import EditProfilePage from './components/editProfilePage/editProfilePage';
import SchedulesPage from './components/schedulesPage/schedulesPage';
import IndividualSchedulePage from './components/schedulesPage/individualSchedulePage/individualSchedulePage';
import CustomersPage from './components/customersPage/customersPage';
import IndividualCustomerPage from './components/customersPage/individualCustomerPage/individualCustomerPage';
import { localStorageWrapper } from './utils/useLocalStorage';
import './App.css';

class App extends Component {
    render() {
        return (
            <Router>
                <React.Fragment>
                    <Container className="main-content">
                        <Routes>
                            <Route  path="/" 
                                    element={
                                        <HomePage
                                            userInfo={this.props.userInfo}
                                            businessInfo={this.props.businessInfo}
                                            updateUserInfo={newUserInfo => this.props.setUserInfo(newUserInfo)}
                                            updateBusinessInfo={newBusinessInfo => this.props.setBusinessInfo(newBusinessInfo)}
                                        />
                                    }
                            />
                            <Route  path="/login" 
                                    element={
                                        <LoginPage
                                            updateUserInfo={newUserInfo => this.props.setUserInfo(newUserInfo)}
                                            updateBusinessInfo={newBusinessInfo => this.props.setBusinessInfo(newBusinessInfo)}
                                        />
                                    }
                            />
                            <Route  path="/editProfile" 
                                    element={
                                        <EditProfilePage 
                                            updateUserInfo={newUserInfo => this.props.setUserInfo({...this.state.userInfo, ...newUserInfo})} // passed here since we cannot serialize functions for navigation()
                                        />
                                    }
                            />
                            <Route  path="/register" 
                                    element={<RegisterPage />}
                            />
                            <Route  path="/schedules"
                                    element={
                                        <SchedulesPage
                                            userInfo={this.props.userInfo}
                                        />
                                    }
                            />
                            <Route  path="/viewSchedule"
                                    element={
                                        <IndividualSchedulePage
                                            userInfo={this.props.userInfo}
                                            businessInfo={this.props.businessInfo}
                                        />
                                    }
                            />
                            <Route  path="/customers"
                                    element={
                                        <CustomersPage
                                            businessInfo={this.props.businessInfo}
                                        />
                                    }
                            />
                            <Route  path="/viewCustomer"
                                    element={
                                        <IndividualCustomerPage
                                            businessInfo={this.props.businessInfo}
                                        />
                                    }
                            />
                        </Routes>
                    </Container>
                </React.Fragment>
            </Router>
        );
    }
};

export default localStorageWrapper(App);