import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '../loginModal/loginModal';
import { RegisterModal } from '../registerModal/registerModal';
import useLocalization from '../../hooks/useLocalization';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { LanguageDropdown } from './languageDropdown';
import PrimeShineAPIClient from '@/api/primeShineApiClient';

export const SideNavbar: React.FC = () => {
    const { userInfo, clearSession } = useContext(LoginSessionContext);
    const { t } = useLocalization();
    const navigate = useNavigate();

    const navigateToLink = (url: string) => {
        PrimeShineAPIClient.handshake(userInfo?.token ?? null)
            .then(() => {
                navigate(url);
            })
            .catch(() => {
                clearSession();
                navigate('/');
            });
    };

    const createDropdownLink = (url: string, text: string) => {
        return (
            <Dropdown.Item onClick={(e) => {
                // TODO: dropdown does not close sometimes when clicking a link
                e.stopPropagation();
                navigateToLink(url);
            }}>
                {text}
            </Dropdown.Item>
        );
    };

    const isLoggedIn = userInfo !== null;

    return (
        <Menu attached="top">
            {
                isLoggedIn &&
                <Dropdown item simple closeOnBlur icon='bars'>
                    <Dropdown.Menu>
                        {createDropdownLink('/invoices', t('Invoices'))}
                        {createDropdownLink('/customers', t('Customers'))}
                        {createDropdownLink('/schedules', t('Schedules'))}
                        {createDropdownLink('/editProfile', t('Edit Profile'))}
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
                                    <span className='cursor-pointer'>
                                        {t('Login')}
                                    </span>
                                }
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <RegisterModal
                                trigger={
                                    <span className='cursor-pointer'>
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
                            className='cursor-pointer'
                            name="home"
                            onClick={() => navigate('/')}
                        />
                    </Menu.Item>
                }
            </Menu.Menu>
        </Menu>
    );
};