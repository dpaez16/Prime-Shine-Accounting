import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'semantic-ui-css/semantic.min.css';
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

    const root = ReactDOM.createRoot(document.getElementById('root'));
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
