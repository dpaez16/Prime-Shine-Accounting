import { WaveInvoiceCreateInput } from '@/types/waveInvoice';
import { useContext, useState } from 'react';
import { InvoiceService } from '../invoicesTable/editInvoiceModal/invoiceItemsForm';
import { LoginSessionContext } from '@/context/LoginSessionContext';

export const useCreateInvoiceForm = () => {
    const loginSession = useContext(LoginSessionContext);
    const businessID = loginSession.businessInfo!.businessId;

    const [invoiceParams, setInvoiceParams] = useState<WaveInvoiceCreateInput>({
        businessId: businessID,
        invoiceDate: '',
        customerId: '',
        memo: '',
        items: [],
    });

    const setInvoiceParam = <K extends keyof WaveInvoiceCreateInput>(key: K, value: WaveInvoiceCreateInput[K]) => {
        setInvoiceParams({
            ...invoiceParams,
            [key]: value,
        });
    };

    const [invoiceServices, setInvoiceServices] = useState<InvoiceService[]>([]);

    return {
        invoiceParams,
        setInvoiceParam,
        invoiceServices,
        setInvoiceServices,
    };
};