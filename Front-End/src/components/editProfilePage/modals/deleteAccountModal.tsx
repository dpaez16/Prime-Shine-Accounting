import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useNavigate } from 'react-router-dom';

export const DeleteAccountModal: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const { clearSession } = context;
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const navigate = useNavigate();

    const handleDeleteAccount = () => {
        PrimeShineAPIClient.deleteUser(userInfo.userID, userInfo.token)
            .then(() => {
                clearSession();
                navigate('/', {
                    replace: true,
                });
            })
            .catch((err) => {
                alert('Failed to delete account: ' + err.message); // TODO: use translation hook
            });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant='destructive'>{t('Delete Account')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Account')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Are you sure?')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteAccount()}>{t('Ok')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};