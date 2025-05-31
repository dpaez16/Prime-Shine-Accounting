import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from './modals/loginModal';
import { RegisterModal } from './modals/registerModal';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { LanguageDropdown } from './languageDropdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HomeIcon } from '@radix-ui/react-icons';
import { MenuDropdown } from './menuDropdown';
import { ThemeToggle } from './theme-toggle';

export const Navbar: React.FC = () => {
    const { userInfo } = useContext(LoginSessionContext);
    const navigate = useNavigate();

    const isLoggedIn = userInfo !== null;

    return (
        <div className={
            cn(
                'w-full border border-b-2 border-border bg-background',
                'flex flex-row align-middle justify-between'
            )
        }>
            <div>
                {
                    isLoggedIn &&
                    <MenuDropdown />
                }
            </div>
            <div className='flex flex-row'>
                <ThemeToggle />
                <LanguageDropdown />
                {
                    !isLoggedIn &&
                    <div>
                        <LoginModal />
                        <RegisterModal />
                    </div>
                }
                {
                    isLoggedIn &&
                    <Button
                        className='hover:cursor-pointer'
                        variant='ghost'
                        onClick={() => navigate('/')}
                    >
                        <HomeIcon />
                    </Button>
                }
            </div>
        </div>
    );
};