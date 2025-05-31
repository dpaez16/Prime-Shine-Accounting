import React, { useContext } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useCreateInvoiceForm } from './useCreateInvoiceForm';
import { InvoiceItemsForm } from '../invoiceItemsForm';
import { WaveInvoiceCreateInput } from '@/types/waveInvoice';
import { WaveAPIClient } from '@/api/waveApiClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectWaveCustomer } from '@/components/ui/selectors/select-wave-customer';

type CreateInvoiceModalProps = {
    onClose: () => void;
    onSuccess: () => void;
};

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = (props) => {
    const loginSession = useContext(LoginSessionContext);
    const userInfo = loginSession.userInfo!;

    const { invoiceParams, setInvoiceParam, invoiceServices, setInvoiceServices } = useCreateInvoiceForm();
    const { t } = useLocalization();

    const getFormParams = () => {
        const sanitizedInvoiceServices = invoiceServices.map(item => ({
            ...item,
            uuid: undefined,
        }));

        return {
            ...invoiceParams,
            items: sanitizedInvoiceServices,
        };
    };

    const isFormValid = () => {
        const formParams = getFormParams();
        const OPTIONAL_FIELDS = ['memo'];

        return Object.entries(formParams).reduce((acc, entry) => {
            const key = entry[0] as keyof WaveInvoiceCreateInput;
            const value = entry[1];

            if (OPTIONAL_FIELDS.includes(key)) {
                return acc && true;
            }

            if (key === 'items') {
                return acc && formParams[key].length > 0;
            }

            return acc && value !== '';
        }, true);
    };

    const handleSubmit = () => {
        const formParams = getFormParams();
        return WaveAPIClient.createInvoice(formParams, userInfo.token)
            .then(() => props.onSuccess())
            .catch(err => alert('Error creating invoice: ' + err.message)); // TODO: use translation hook
    };

    return (
        <Dialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Create Invoice')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Customer')}>
                        <SelectWaveCustomer
                            placeholder={t('Select Customer')}
                            onChange={(newValue) => setInvoiceParam('customerId', newValue!)}
                            customerID={invoiceParams.customerId}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Date of Service')}>
                        <DatePicker
                            onChange={(newValue) => setInvoiceParam('invoiceDate', newValue?.toUTCString() ?? '')}
                            value={invoiceParams.invoiceDate ? new Date(invoiceParams.invoiceDate) : undefined}
                        />
                    </GridFormItem>
                    <InvoiceItemsForm
                        className='my-2'
                        invoiceServices={invoiceServices}
                        onChange={setInvoiceServices}
                    />
                    <GridFormItem label={t('Memo')}>
                        <Input
                            onChange={(e) => setInvoiceParam('memo', e.target.value)}
                            value={invoiceParams.memo}
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