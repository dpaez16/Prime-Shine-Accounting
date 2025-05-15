import { BusinessInfo } from '@/types/businessInfo';
import { UserInfo } from '@/types/userInfo';
import { createContext } from 'react';

export interface LoginSession {
    userInfo: UserInfo | null;
    businessInfo: BusinessInfo | null;
    updateUserInfo: (data: UserInfo) => void;
    updateBusinessInfo: (data: BusinessInfo) => void;
    clearSession: () => void;
}

export const LoginSessionContext = createContext<LoginSession>({
    userInfo: null,
    businessInfo: null,
    updateUserInfo: () => { },
    updateBusinessInfo: () => { },
    clearSession: () => { },
});
