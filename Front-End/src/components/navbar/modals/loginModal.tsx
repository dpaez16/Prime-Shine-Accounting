import React, { useContext, useState } from 'react';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import useLocalization from '@/hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/error-message';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';

export const LoginModal: React.FC = () => {
    const { updateUserInfo, updateBusinessInfo } = useContext(LoginSessionContext);

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);
    const [userParams, setUserParams] = useState({
        email: '',
        password: '',
    });

    const { t } = useLocalization();

    const handleUserLogin = () => {
        const { email, password } = userParams;
        setError(null);
        setLoading(true);

        return PrimeShineAPIClient.loginUser(email, password)
            .then(data => {
                updateUserInfo(data.userInfo);
                updateBusinessInfo(data.businessInfo);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    };

    const handleFormChange = (name: string, value: string) => {
        setUserParams({
            ...userParams,
            [name]: value,
        });
    };

    const resetFormParams = () => {
        setError(null);
        setLoading(false);

        setUserParams({
            email: '',
            password: '',
        });
    };

    const isFormValid = () => {
        const { email, password } = userParams;
        return !!email && !!password;
    };

    return (
        <Dialog
            onOpenChange={() => resetFormParams()}
        >
            <DialogTrigger asChild>
                <Button variant="ghost">
                    {t('Login')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('Login')}
                    </DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Email')}>
                        <Input
                            name='email'
                            value={userParams.email}
                            onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Password')}>
                        <Input
                            name='password'
                            type='password'
                            value={userParams.password}
                            onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                        />
                    </GridFormItem>
                </GridForm>
                <ErrorMessage message={error?.message} />
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={() => handleUserLogin()}
                        disabled={!isFormValid() || loading}
                        loading={loading}
                    >
                        {t('Login')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
