import React, {Component} from 'react';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import LoginModal from '../loginModal/loginModal';
import RegisterModal from '../registerModal/registerModal';
import componentWrapper from '../../utils/componentWrapper';
import translationWrapper from '../../utils/translationWrapper';
import './sideNavbar.css';

class SideNavbar extends Component {
    createDropdownLink(url, name) {
        return (
            <a 
                className="SideNavbar_menu_link"
                href={url}
            >
                {name}
            </a>
        );
    }

    render() {
        const {isLoggedIn, t} = this.props;

        return (
            <Menu attached='top'>
                {
                    isLoggedIn && 
                    <Dropdown 
                        item 
                        simple
                        icon='bars'
                    >
                        <Dropdown.Menu>
                            <Dropdown.Item>{this.createDropdownLink("/invoices", t("Invoices"))}</Dropdown.Item>
                            <Dropdown.Item>{this.createDropdownLink("/customers", t("Customers"))}</Dropdown.Item>
                            <Dropdown.Item>{this.createDropdownLink("/schedules", t("Schedules"))}</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item>{this.createDropdownLink("/editProfile", t("Edit Profile"))}</Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    this.props.updateUserInfo(null);
                                    this.props.updateBusinessInfo(null);
                                    this.props.navigation('/');
                                }}
                            >
                                {t("Logout")}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                }

                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Dropdown
                            simple
                            text={t('Language')}
                        >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => this.props.changeLanguage('en')}>{t('English')}</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.props.changeLanguage('es')}>{t('Spanish')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                    {
                        !isLoggedIn && 
                        <React.Fragment>
                            <Menu.Item>
                                <LoginModal
                                    trigger={<span className='SideNavbar_menu_right_options'>{t('Login')}</span>}
                                    updateUserInfo={this.props.updateUserInfo}
                                    updateBusinessInfo={this.props.updateBusinessInfo}
                                />
                            </Menu.Item>
                            <Menu.Item>
                                <RegisterModal
                                    trigger={<span className='SideNavbar_menu_right_options'>{t('Register')}</span>}
                                    updateUserInfo={this.props.updateUserInfo}
                                    updateBusinessInfo={this.props.updateBusinessInfo}
                                />
                            </Menu.Item>
                        </React.Fragment>
                    }
                    {
                        isLoggedIn &&
                        <Menu.Item>
                            <Icon
                                className='SideNavbar_menu_right_options'
                                name='home'
                                onClick={() => this.props.navigation("/")}
                            />
                        </Menu.Item>
                    }
                </Menu.Menu>
            </Menu>
        );
    }
};

export default translationWrapper(componentWrapper(SideNavbar));