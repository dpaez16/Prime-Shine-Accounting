import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useNavigate } from 'react-router-dom';

export const MenuDropdown: React.FC = () => {
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
            <NavigationMenuLink
                className='text-nowrap hover:cursor-pointer'
                onClick={() => {
                    navigateToLink(url);
                }}
            >
                {text}
            </NavigationMenuLink>
        );
    };

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger><HamburgerMenuIcon /></NavigationMenuTrigger>
                    <NavigationMenuContent>
                        {createDropdownLink('/invoices', t('Invoices'))}
                        {createDropdownLink('/customers', t('Customers'))}
                        {createDropdownLink('/schedules', t('Schedules'))}
                        {createDropdownLink('/edit-profile', t('Edit Profile'))}
                        <NavigationMenuLink
                            className='text-nowrap hover:cursor-pointer'
                            onClick={() => {
                                clearSession();
                                navigate('/');
                            }}
                        >
                            {t('Logout')}
                        </NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};