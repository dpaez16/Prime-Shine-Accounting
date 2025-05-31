import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import './i18n';
import PrimeShineAPIClient from './api/primeShineApiClient';
import { getLocalStorageObject, removeLocalStorageItem } from './utils/localStorage';
import { UserInfo } from './types/userInfo';

const main = async () => {
    const userInfo = getLocalStorageObject<UserInfo>('userInfo');
    const isValid = await PrimeShineAPIClient.handshake(userInfo?.token ?? null);

    if (!isValid) {
        removeLocalStorageItem('userInfo');
        removeLocalStorageItem('businessInfo');

        if (document.location.pathname !== '/') {
            document.location.href = '/';
        }
    }

    const rootElem = document.getElementById('root');
    if (!rootElem) {
        return null;
    }

    const root = ReactDOM.createRoot(rootElem);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

main().catch(err => {
    console.log(err);
    document.location.href = '/';
});
