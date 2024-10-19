import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import HomePage from './components/homePage/homePage';
import EditProfilePage from './components/editProfilePage/editProfilePage';
import SchedulesPage from './components/schedulesPage/schedulesPage';
import IndividualSchedulePage from './components/schedulesPage/individualSchedulePage/individualSchedulePage';
import CustomersPage from './components/customersPage/customersPage';
import IndividualCustomerPage from './components/customersPage/individualCustomerPage/individualCustomerPage';
import InvoicesPage from './components/invoicesPage/invoicesPage';
import SideNavbar from './components/sideNavbar/sideNavbar';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

export default function App() {
    const [userInfo, setUserInfo] = useLocalStorage('userInfo', null);
    const [businessInfo, setBusinessInfo] = useLocalStorage('businessInfo', null);

    return (
        <Router>
            <React.Fragment>
                <SideNavbar
                    isLoggedIn={userInfo !== null}
                    updateUserInfo={newUserInfo => setUserInfo(newUserInfo)}
                    updateBusinessInfo={newBusinessInfo => setBusinessInfo(newBusinessInfo)}
                />
                <Container fluid className="main-content">
                    <Routes>
                        <Route  path="/"
                                element={
                                    <HomePage
                                        userInfo={userInfo}
                                        businessInfo={businessInfo}
                                    />
                                }
                        />
                        <Route  path="/editProfile"
                                element={
                                    <EditProfilePage
                                        userInfo={userInfo}
                                        updateUserInfo={newUserInfo => setUserInfo({ ...userInfo, ...newUserInfo })}
                                        logoutHandler={() => {
                                            setUserInfo(null);
                                            setBusinessInfo(null);
                                        }}
                                    />
                                }
                        />
                        <Route  path="/schedules"
                                element={
                                    <SchedulesPage
                                        userInfo={userInfo}
                                    />
                                }
                        />
                        <Route  path="/viewSchedule"
                                element={
                                    <IndividualSchedulePage
                                        userInfo={userInfo}
                                        businessInfo={businessInfo}
                                    />
                                }
                        />
                        <Route  path="/customers"
                                element={
                                    <CustomersPage
                                        businessInfo={businessInfo}
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
                                        businessInfo={businessInfo}
                                    />
                                }
                        />
                    </Routes>
                </Container>
            </React.Fragment>
        </Router>
    );
};