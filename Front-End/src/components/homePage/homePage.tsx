import React, { useContext } from 'react';
import useLocalization from '../../hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';

export default function HomePage() {
    const { userInfo } = useContext(LoginSessionContext);
    const { t } = useLocalization();

    const getWelcomeElement = () => {
        if (!userInfo) {
            return null;
        }

        const { name } = userInfo;

        return (
            <p>{t('Welcome')}, {name}</p>
        );
    };

    const welcomeElement = getWelcomeElement();

    return (
        <div className='flex flex-col text-center'>
            <h1>Prime Shine Accounting</h1>
            {welcomeElement}
        </div>
    );
};
