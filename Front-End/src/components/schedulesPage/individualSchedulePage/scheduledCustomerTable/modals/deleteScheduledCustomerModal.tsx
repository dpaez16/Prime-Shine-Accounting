import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { constructTimeStr } from '@/utils/helpers';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type DeleteScheduledCustomerModalProps = {
    scheduledCustomer: FullScheduledCustomer;
    onSubmit: () => void;
    onClose: () => void;
};

export const DeleteScheduledCustomerModal: React.FC<DeleteScheduledCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const customer = props.scheduledCustomer;

    const handleSubmit = () => {
        PrimeShineAPIClient.deleteScheduledCustomer(
            customer.scheduledCustomerID,
            userInfo.token,
        )
            .then(() => props.onSubmit())
            .catch((err) => alert('Failed to delete scheduled customer: ' + err.message)); // TODO: use translation hook
    };

    return (
        <AlertDialog
            open={true}
            onOpenChange={isOpen => !isOpen && props.onClose()}
        >
            <AlertDialogTrigger asChild>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Customer?')}</AlertDialogTitle>
                    <div>
                        <p>{t('Customer')}: {customer.metadata.name}</p>
                        <p>{t('Service Start Time')}: {constructTimeStr(customer.startTime)}</p>
                        <p>{t('Service End Time')}: {constructTimeStr(customer.endTime)}</p>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSubmit()}>{t('Ok')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
