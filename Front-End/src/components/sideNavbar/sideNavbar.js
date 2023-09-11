import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../loginModal/loginModal';
import RegisterModal from '../registerModal/registerModal';
import useLocalization from '../../hooks/useLocalization';
import { ENGLISH_LOCALE, SPANISH_LOCALE } from '../../utils/consts';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import './sideNavbar.css';

export default function SideNavbar(props) {
    const [t, changeLanguage] = useLocalization();
    const navigate = useNavigate();

    const createDropdownLink = (url, name) => {
        return (
            <a 
                className="SideNavbar_menu_link"
                href={url}
            >
                {name}
            </a>
        );
    };

    const {isLoggedIn} = props;

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
                        <Dropdown.Item>{createDropdownLink("/invoices", t("Invoices"))}</Dropdown.Item>
                        <Dropdown.Item>{createDropdownLink("/customers", t("Customers"))}</Dropdown.Item>
                        <Dropdown.Item>{createDropdownLink("/schedules", t("Schedules"))}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>{createDropdownLink("/editProfile", t("Edit Profile"))}</Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                props.updateUserInfo(null);
                                props.updateBusinessInfo(null);
                                navigate('/');
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
                            <Dropdown.Item onClick={() => changeLanguage(ENGLISH_LOCALE)}>{t('English')}</Dropdown.Item>
                            <Dropdown.Item onClick={() => changeLanguage(SPANISH_LOCALE)}>{t('Spanish')}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>
                {
                    !isLoggedIn && 
                    <React.Fragment>
                        <Menu.Item>
                            <LoginModal
                                trigger={<span className='SideNavbar_menu_right_options'>{t('Login')}</span>}
                                updateUserInfo={props.updateUserInfo}
                                updateBusinessInfo={props.updateBusinessInfo}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <RegisterModal
                                trigger={<span className='SideNavbar_menu_right_options'>{t('Register')}</span>}
                                updateUserInfo={props.updateUserInfo}
                                updateBusinessInfo={props.updateBusinessInfo}
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
                            onClick={() => navigate("/")}
                        />
                    </Menu.Item>
                }
            </Menu.Menu>
        </Menu>
    );
};