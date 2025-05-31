import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoice } from '@/types/waveInvoice';
import { constructDate, dateToStr } from '@/utils/helpers';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type DeleteInvoiceModalProps = {
    invoice: WaveInvoice;
    onSuccess: () => void;
    onClose: () => void;
};

export const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = (props) => {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;

    const { t } = useLocalization();

    const { invoice } = props;
    const invoiceDate = constructDate(invoice.invoiceDate);

    const handleSubmit = () => {
        return WaveAPIClient.deleteInvoice(invoice.id, userInfo.token)
            .then(() => props.onSuccess())
            .catch(err => alert('Error deleting invoice: ' + err.message)); // TODO: use translation hook
    };

    return (
        <AlertDialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <AlertDialogTrigger asChild></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Invoice?')}</AlertDialogTitle>
                </AlertDialogHeader>
                <div>
                    <p>
                        {t('Invoice Number')}: {invoice.invoiceNumber}
                    </p>
                    <p>
                        {t('Date of Service')}: {dateToStr(invoiceDate)}
                    </p>
                    <p>
                        {t('Customer')}: {invoice.customer.name}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSubmit()}>{t('Ok')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
