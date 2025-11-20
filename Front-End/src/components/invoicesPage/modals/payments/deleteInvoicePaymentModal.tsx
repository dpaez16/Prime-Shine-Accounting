import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { constructDate, dateToStr, parseWavePaymentMethod } from '@/utils/helpers';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { WaveInvoicePayment } from '@/types/waveInvoicePayment';
import { WaveInternalInvoiceID } from '@/types/waveInvoice';

type DeleteInvoicePaymentModalProps = {
    internalInvoiceID: WaveInternalInvoiceID;
    invoicePayment: WaveInvoicePayment;
    onSuccess: () => void;
    onClose: () => void;
};

export const DeleteInvoicePaymentModal: React.FC<DeleteInvoicePaymentModalProps> = (props) => {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;
    const businessInfo = loginSession.businessInfo!;

    const { t } = useLocalization();

    const { invoicePayment } = props;

    const handleSubmit = () => {
        return WaveAPIClient.deleteInvoicePayment(businessInfo.identityBusinessID, props.internalInvoiceID, invoicePayment.id, userInfo.token)
            .then(() => props.onSuccess())
            .catch(err => alert('Error deleting invoice: ' + err.message)); // TODO: use translation hook
    };

    return (
        <AlertDialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <AlertDialogTrigger asChild></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Invoice Payment?')}</AlertDialogTitle>
                </AlertDialogHeader>
                <div>
                    <p>
                        {t('Payment Date')}: {dateToStr(constructDate(invoicePayment.payment_date), 'mm/dd/yyyy')}
                    </p>
                    <p>
                        {t('Amount')}: {'$' + invoicePayment.amount.toString()}
                    </p>
                    <p>
                        {t('Payment Method')}: {parseWavePaymentMethod(invoicePayment.payment_method)}
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
