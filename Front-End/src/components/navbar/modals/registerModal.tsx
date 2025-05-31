import React, { useContext, useState } from 'react';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import useLocalization from '@/hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/ui/error-message';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';

export const RegisterModal: React.FC = () => {
    const { updateUserInfo, updateBusinessInfo } = useContext(LoginSessionContext);

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);
    const [userParams, setUserParams] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { t } = useLocalization();

    const handleUserLogin = () => {
        const { name, email, password } = userParams;
        setError(null);
        setLoading(true);

        return PrimeShineAPIClient.createUser(name, email, password)
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
        setUserParams({
            name: '',
            email: '',
            password: '',
        });
    };

    const isFormValid = () => {
        const { name, email, password } = userParams;
        return !!name && !!email && !!password;
    };

    return (
        <Dialog
            onOpenChange={() => resetFormParams()}
        >
            <DialogTrigger asChild>
                <Button variant="ghost">
                    {t('Register')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('Register')}
                    </DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Name')}>
                        <Input
                            name='name'
                            value={userParams.name}
                            onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                        />
                    </GridFormItem>
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
                        {t('Register')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
