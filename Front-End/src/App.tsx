import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/homePage/homePage';
import EditProfilePage from './components/editProfilePage/editProfilePage';
import SchedulesPage from './components/schedulesPage/schedulesPage';
import IndividualSchedulePage from './components/schedulesPage/individualSchedulePage/individualSchedulePage';
import CustomersPage from './components/customersPage/customersPage';
import IndividualCustomerPage from './components/customersPage/individualCustomerPage/individualCustomerPage';
import InvoicesPage from './components/invoicesPage/invoicesPage';
import SideNavbar from './components/sideNavbar/sideNavbar';
import { LoginSession, LoginSessionContext } from './context/LoginSessionContext';
import { UserInfo } from './types/userInfo';
import { BusinessInfo } from './types/businessInfo';
import useLocalStorage from './hooks/useLocalStorage';

export default function App() {
    const { localStorageValue: userInfo, setLocalStorageValue: setUserInfo } = useLocalStorage<UserInfo>('userInfo');
    const { localStorageValue: businessInfo, setLocalStorageValue: setBusinessInfo } = useLocalStorage<BusinessInfo>('businessInfo');

    const loginSession: LoginSession = {
        userInfo,
        businessInfo,
        updateUserInfo: setUserInfo,
        updateBusinessInfo: setBusinessInfo,
        clearSession: () => {
            setUserInfo(null);
            setBusinessInfo(null);
        }
    };

    return (
        <Router>
            <LoginSessionContext.Provider value={loginSession}>
            <React.Fragment>
                <SideNavbar />
                <div className='p-8'>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        {userInfo &&
                            <>
                                <Route path="/editProfile" element={<EditProfilePage />} />
                                <Route path="/schedules" element={<SchedulesPage />} />
                                <Route path="/viewSchedule" element={<IndividualSchedulePage />} />
                                <Route path="/customers" element={<CustomersPage />} />
                                <Route path="/viewCustomer" element={<IndividualCustomerPage/>} />
                                <Route path="/invoices" element={<InvoicesPage />} />
                            </>
                        }
                    </Routes>
                </div>
            </React.Fragment>
            </LoginSessionContext.Provider>
        </Router>
    );
};
