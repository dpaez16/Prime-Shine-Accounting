import React, { useContext, useState } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { WaveCustomer } from '@/types/waveCustomer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { WaveAPIClient } from '@/api/waveApiClient';

type DeleteCustomerModalProps = {
    customer: WaveCustomer;
    onSuccess: () => void;
}

export const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const [open, setOpen] = useState(false);

    const customer = props.customer;

    const deleteCustomerHandler = () => {
        return WaveAPIClient.deleteCustomer(customer.id, userInfo.token)
            .then(() => {
                props.onSuccess();
                setOpen(false);
            })
            .catch((err) => alert('Failed to delete customer: ' + err.message)); // TODO: use translation hook
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant='destructive'>{t('Delete')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Customer?')}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCustomerHandler()}>
                        {t('Ok')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};