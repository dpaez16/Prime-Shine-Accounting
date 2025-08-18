import { LoginSessionContext } from '@/context/LoginSessionContext';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoicePayment } from '@/types/waveInvoicePayment';
import React, { useContext } from 'react';
import { useEditInvoicePaymentForm } from './useEditInvoicePaymentForm';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { DatePicker } from '@/components/ui/date-picker';
import { constructDate, dateToStr } from '@/utils/helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateMoney } from '@/utils/validators';
import { SelectWaveInvoicePaymentMethod } from '@/components/ui/selectors/select-wave-payment-method';
import { WaveInternalInvoiceID } from '@/types/waveInvoice';

type EditInvoicePaymentModalProps = {
    internalInvoiceID: WaveInternalInvoiceID;
    invoicePayment: WaveInvoicePayment;
    onSuccess: () => void;
    onClose: () => void;
};

export const EditInvoicePaymentModal: React.FC<EditInvoicePaymentModalProps> = (props) => {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;

    const { invoicePaymentParams, setInvoicePaymentParam } = useEditInvoicePaymentForm(props.invoicePayment);
    const { t } = useLocalization();

    const isFormValid = () => {
        return (
            !!invoicePaymentParams.payment_date &&
            validateMoney(invoicePaymentParams.amount.toString()) &&
            parseFloat(invoicePaymentParams.amount.toString()) > 0 // we don't want values of 0 to be valid
        );
    };

    // TODO
    const handleSubmit = () => {
        //return WaveAPIClient.editInvoicePayment(props.internalInvoiceID, invoicePaymentParams, userInfo.token)
        //    .then(() => props.onSuccess())
        //    .catch(err => alert('Error editing invoice payment: ' + err.message)); // TODO: use translation hook

        props.onSuccess();
    };

    return (
        <Dialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Edit Invoice Payment')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Payment Date')}>
                        <DatePicker
                            onChange={(newValue) => setInvoicePaymentParam('payment_date', newValue ? dateToStr(newValue, 'yyyy-mm-dd') : '')}
                            value={invoicePaymentParams.payment_date ? constructDate(invoicePaymentParams.payment_date)  : undefined}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Payment Method')}>
                        <SelectWaveInvoicePaymentMethod
                            paymentMethod={invoicePaymentParams.payment_method}
                            onChange={(newValue) => newValue && setInvoicePaymentParam('payment_method', newValue)}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Amount')}>
                        <Input
                            onChange={(e) => setInvoicePaymentParam('amount', e.target.value)}
                            value={invoicePaymentParams.amount}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Memo')}>
                        <Input
                            onChange={(e) => setInvoicePaymentParam('memo', e.target.value)}
                            value={invoicePaymentParams.memo}
                        />
                    </GridFormItem>
                </GridForm>
                <DialogFooter>
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={!isFormValid()}
                    >
                        {t('Ok')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};