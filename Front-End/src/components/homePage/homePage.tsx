import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { PageTitle } from '@/components/ui/page-title';

export const HomePage: React.FC = () => {
    const { userInfo } = useContext(LoginSessionContext);
    const { t } = useLocalization();

    const getWelcomeElement = () => {
        if (!userInfo) {
            return null;
        }

        const { name } = userInfo;

        return (
            <p className='font-primary'>{t('Welcome')}, {name}</p>
        );
    };

    const welcomeElement = getWelcomeElement();

    return (
        <div className='flex flex-col text-center gap-2'>
            <PageTitle>Prime Shine Cleaning</PageTitle>
            {welcomeElement}
        </div>
    );
};
