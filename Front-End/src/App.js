import React, {Component} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Container} from 'semantic-ui-react';
import HomePage from './components/homePage/homePage';
import EditProfilePage from './components/editProfilePage/editProfilePage';
import SchedulesPage from './components/schedulesPage/schedulesPage';
import IndividualSchedulePage from './components/schedulesPage/individualSchedulePage/individualSchedulePage';
import CustomersPage from './components/customersPage/customersPage';
import IndividualCustomerPage from './components/customersPage/individualCustomerPage/individualCustomerPage';
import InvoicesPage from './components/invoicesPage/invoicesPage';
import SideNavbar from './components/sideNavbar/sideNavbar';
import { localStorageWrapper } from './utils/useLocalStorage';
import './App.css';

class App extends Component {
    render() {
        return (
            <Router>
                <React.Fragment>
                    <SideNavbar 
                        isLoggedIn={this.props.userInfo !== null}
                        updateUserInfo={newUserInfo => this.props.setUserInfo(newUserInfo)}
                        updateBusinessInfo={newBusinessInfo => this.props.setBusinessInfo(newBusinessInfo)}
                    />
                    <Container fluid className="main-content">
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
                            <Route  path="/editProfile" 
                                    element={
                                        <EditProfilePage
                                            userInfo={this.props.userInfo}
                                            updateUserInfo={newUserInfo => this.props.setUserInfo({...this.props.userInfo, ...newUserInfo})}
                                        />
                                    }
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
                                        <IndividualCustomerPage/>
                                    }
                            />
                            <Route  path="/invoices"
                                    element={
                                        <InvoicesPage
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