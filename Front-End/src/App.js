import React, {Component} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './components/homePage/homePage';
import LoginPage from './components/loginPage/loginPage';
import RegisterPage from './components/registerPage/registerPage';
import EditProfilePage from './components/editProfilePage/editProfilePage';
import SchedulesPage from './components/schedulesPage/schedulesPage';
import './App.css';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userInfo: null,
            businessInfo: null
        };
    }

    render() {
        return (
            <Router>
                <React.Fragment>
                    <div className="main-content">
                        <Routes>
                            <Route  path="/" 
                                    element={
                                        <HomePage
                                            userInfo={this.state.userInfo}
                                            businessInfo={this.state.businessInfo}
                                        />
                                    }
                            />
                            <Route  path="/login" 
                                    element={
                                        <LoginPage
                                            updateUserInfo={newUserInfo => this.setState({userInfo: newUserInfo})}
                                            updateBusinessInfo={newBusinessInfo => this.setState({businessInfo: newBusinessInfo})}
                                        />
                                    }
                            />
                            <Route  path="/editProfile" 
                                    element={
                                        <EditProfilePage 
                                            updateUserInfo={newUserInfo => this.setState({userInfo: {...this.state.userInfo, ...newUserInfo}})} // passed here since we cannot serialize functions for navigation()
                                        />
                                    }
                            />
                            <Route  path="/register" 
                                    element={<RegisterPage />}
                            />
                            <Route  path="/schedules"
                                    element={
                                        <SchedulesPage
                                            userInfo={this.state.userInfo}
                                        />
                                    }
                            />
                        </Routes>
                    </div>
                </React.Fragment>
            </Router>
        );
    }
};