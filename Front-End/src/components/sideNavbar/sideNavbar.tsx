import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../loginModal/loginModal';
import RegisterModal from '../registerModal/registerModal';
import useLocalization from '../../hooks/useLocalization';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import './sideNavbar.css';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import LanguageDropdown from './languageDropdown';

export default function SideNavbar() {
    const { userInfo, clearSession } = useContext(LoginSessionContext);
    const { t } = useLocalization();
    const navigate = useNavigate();

    const createDropdownLink = (url: string, name: string) => {
        return (
            <a className="SideNavbar_menu_link" href={url}>
                {name}
            </a>
        );
    };

    const isLoggedIn = userInfo !== null;

    return (
        <Menu attached="top">
            {
                isLoggedIn &&
                <Dropdown item simple icon="bars">
                    <Dropdown.Menu>
                        <Dropdown.Item>
                            {createDropdownLink('/invoices', t('Invoices'))}
                        </Dropdown.Item>
                        <Dropdown.Item>
                            {createDropdownLink('/customers', t('Customers'))}
                        </Dropdown.Item>
                        <Dropdown.Item>
                            {createDropdownLink('/schedules', t('Schedules'))}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>
                            {createDropdownLink('/editProfile', t('Edit Profile'))}
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                clearSession();
                                navigate('/');
                            }}
                        >
                            {t('Logout')}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            }

            <Menu.Menu position="right">
                <Menu.Item>
                    <LanguageDropdown />
                </Menu.Item>
                {
                    !isLoggedIn &&
                    <React.Fragment>
                        <Menu.Item>
                            <LoginModal
                                trigger={
                                    <span className="SideNavbar_menu_right_options">
                                        {t('Login')}
                                    </span>
                                }
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <RegisterModal
                                trigger={
                                    <span className="SideNavbar_menu_right_options">
                                        {t('Register')}
                                    </span>
                                }
                            />
                        </Menu.Item>
                    </React.Fragment>
                }
                {
                    isLoggedIn &&
                    <Menu.Item>
                        <Icon
                            className="SideNavbar_menu_right_options"
                            name="home"
                            onClick={() => navigate('/')}
                        />
                    </Menu.Item>
                }
            </Menu.Menu>
        </Menu>
    );
}
